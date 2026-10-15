import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, type, owner, balance, accountNumber, color, icon, isDefault } = body;

    if (isDefault) {
      await prisma.account.updateMany({
        where: { id: { not: id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(type ? { type } : {}),
        ...(owner ? { owner } : {}),
        ...(balance !== undefined ? { balance: parseFloat(balance) } : {}),
        ...(accountNumber !== undefined ? { accountNumber: accountNumber?.trim() || null } : {}),
        ...(color ? { color } : {}),
        ...(icon ? { icon } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui rekening' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.account.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Rekening berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus rekening' }, { status: 500 });
  }
}
