import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, budgetRule, icon, color } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(budgetRule ? { budgetRule } : {}),
        ...(icon ? { icon } : {}),
        ...(color ? { color } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui kategori' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category is used in transactions
    const txCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (txCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kategori ini sudah digunakan dalam ${txCount} transaksi. Anda tidak dapat menghapusnya agar riwayat keuangan tetap konsisten.`,
        },
        { status: 400 }
      );
    }

    // Delete associated budgets first if any
    await prisma.budget.deleteMany({
      where: { categoryId: id },
    });

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}
