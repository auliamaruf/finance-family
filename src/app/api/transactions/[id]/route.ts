import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Revert account balance impact
      if (existing.type === 'EXPENSE') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
      } else if (existing.type === 'INCOME') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { decrement: existing.amount } },
        });
      } else if (existing.type === 'TRANSFER' && existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const {
      date,
      type,
      amount,
      title,
      notes,
      performedBy,
      beneficiary,
      categoryId,
      accountId,
      toAccountId,
    } = body;

    const parsedAmount = parseFloat(amount);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Revert old balance
      if (existing.type === 'EXPENSE') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
      } else if (existing.type === 'INCOME') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { decrement: existing.amount } },
        });
      } else if (existing.type === 'TRANSFER' && existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      // 2. Apply new balance
      const newType = type || existing.type;
      const newAccId = accountId || existing.accountId;
      const newToAccId = newType === 'TRANSFER' ? (toAccountId || existing.toAccountId) : null;

      if (newType === 'EXPENSE') {
        await tx.account.update({
          where: { id: newAccId },
          data: { balance: { decrement: parsedAmount } },
        });
      } else if (newType === 'INCOME') {
        await tx.account.update({
          where: { id: newAccId },
          data: { balance: { increment: parsedAmount } },
        });
      } else if (newType === 'TRANSFER' && newToAccId) {
        await tx.account.update({
          where: { id: newAccId },
          data: { balance: { decrement: parsedAmount } },
        });
        await tx.account.update({
          where: { id: newToAccId },
          data: { balance: { increment: parsedAmount } },
        });
      }

      // 3. Update transaction
      return await tx.transaction.update({
        where: { id },
        data: {
          date: date ? new Date(date) : existing.date,
          type: newType,
          amount: parsedAmount,
          title: title ? title.trim() : existing.title,
          notes: notes !== undefined ? notes?.trim() : existing.notes,
          performedBy: performedBy || existing.performedBy,
          beneficiary: beneficiary || existing.beneficiary,
          categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
          accountId: newAccId,
          toAccountId: newToAccId,
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
        },
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui transaksi' }, { status: 500 });
  }
}
