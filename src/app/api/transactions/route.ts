import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const type = searchParams.get('type');
    const performedBy = searchParams.get('performedBy');
    const categoryId = searchParams.get('categoryId');
    const accountId = searchParams.get('accountId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: any = {};

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    } else if (year) {
      const y = parseInt(year, 10);
      where.date = {
        gte: new Date(y, 0, 1),
        lte: new Date(y, 11, 31, 23, 59, 59, 999),
      };
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (performedBy && performedBy !== 'ALL') {
      where.performedBy = performedBy;
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    if (accountId && accountId !== 'ALL') {
      where.OR = [
        { accountId: accountId },
        { toAccountId: accountId },
      ];
    }

    if (search && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil transaksi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      date,
      type,
      amount,
      title,
      notes,
      performedBy = 'JOINT',
      beneficiary = 'FAMILY',
      categoryId,
      accountId,
      toAccountId,
    } = body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Nominal transaksi harus lebih dari 0' }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ success: false, error: 'Judul / keterangan transaksi wajib diisi' }, { status: 400 });
    }

    if (!accountId) {
      return NextResponse.json({ success: false, error: 'Rekening / dompet sumber wajib dipilih' }, { status: 400 });
    }

    // Execute in a transaction to safely adjust balances
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          date: date ? new Date(date) : new Date(),
          type,
          amount: parsedAmount,
          title: title.trim(),
          notes: notes?.trim() || null,
          performedBy,
          beneficiary,
          categoryId: categoryId || null,
          accountId,
          toAccountId: type === 'TRANSFER' ? toAccountId : null,
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
        },
      });

      // Update account balance
      if (type === 'EXPENSE') {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: parsedAmount } },
        });
      } else if (type === 'INCOME') {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: parsedAmount } },
        });
      } else if (type === 'TRANSFER' && toAccountId) {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: parsedAmount } },
        });
        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: parsedAmount } },
        });
      }

      return transaction;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat transaksi baru' }, { status: 500 });
  }
}
