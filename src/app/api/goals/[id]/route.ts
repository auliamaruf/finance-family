import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, targetAmount, currentAmount, deadline, owner, notes, isCompleted } = body;

    const existing = await prisma.financialGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Target tidak ditemukan' }, { status: 404 });
    }

    const cur = currentAmount !== undefined ? parseFloat(currentAmount) : existing.currentAmount;
    const tgt = targetAmount !== undefined ? parseFloat(targetAmount) : existing.targetAmount;

    const updated = await prisma.financialGoal.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(targetAmount !== undefined ? { targetAmount: tgt } : {}),
        ...(currentAmount !== undefined ? { currentAmount: cur } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(owner ? { owner } : {}),
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        isCompleted: isCompleted !== undefined ? isCompleted : cur >= tgt,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui target tabungan' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.financialGoal.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Target berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus target' }, { status: 500 });
  }
}
