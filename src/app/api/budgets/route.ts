import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);

    const budgets = await prisma.budget.findMany({
      where: { month, year },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    });

    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil anggaran' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Copy from another month action
    if (body.action === 'copy_from') {
      const { fromMonth, fromYear, toMonth, toYear } = body;
      const sourceBudgets = await prisma.budget.findMany({
        where: { month: parseInt(fromMonth, 10), year: parseInt(fromYear, 10) },
      });

      if (sourceBudgets.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Tidak ada data anggaran pada bulan sumber yang dipilih.' },
          { status: 400 }
        );
      }

      // Upsert into target month
      await prisma.$transaction(
        sourceBudgets.map((b) =>
          prisma.budget.upsert({
            where: {
              categoryId_month_year: {
                categoryId: b.categoryId,
                month: parseInt(toMonth, 10),
                year: parseInt(toYear, 10),
              },
            },
            update: { amount: b.amount },
            create: {
              categoryId: b.categoryId,
              month: parseInt(toMonth, 10),
              year: parseInt(toYear, 10),
              amount: b.amount,
            },
          })
        )
      );

      const updated = await prisma.budget.findMany({
        where: { month: parseInt(toMonth, 10), year: parseInt(toYear, 10) },
        include: { category: true },
      });

      return NextResponse.json({ success: true, data: updated, message: 'Anggaran berhasil disalin.' });
    }

    // 2. Bulk Save action
    if (body.action === 'bulk_save' && Array.isArray(body.items)) {
      const { month, year, items } = body;
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);

      await prisma.$transaction(
        items.map((item: { categoryId: string; amount: number }) =>
          prisma.budget.upsert({
            where: {
              categoryId_month_year: {
                categoryId: item.categoryId,
                month: parsedMonth,
                year: parsedYear,
              },
            },
            update: { amount: Math.max(0, parseFloat(String(item.amount)) || 0) },
            create: {
              categoryId: item.categoryId,
              month: parsedMonth,
              year: parsedYear,
              amount: Math.max(0, parseFloat(String(item.amount)) || 0),
            },
          })
        )
      );

      const updated = await prisma.budget.findMany({
        where: { month: parsedMonth, year: parsedYear },
        include: { category: true },
      });

      return NextResponse.json({ success: true, data: updated, message: 'Semua anggaran berhasil disimpan.' });
    }

    // 3. Single Save
    const { categoryId, month, year, amount } = body;
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const parsedAmount = parseFloat(amount);

    if (!categoryId || !parsedMonth || !parsedYear) {
      return NextResponse.json({ success: false, error: 'Data anggaran tidak lengkap' }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId,
          month: parsedMonth,
          year: parsedYear,
        },
      },
      update: {
        amount: parsedAmount >= 0 ? parsedAmount : 0,
      },
      create: {
        categoryId,
        month: parsedMonth,
        year: parsedYear,
        amount: parsedAmount >= 0 ? parsedAmount : 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error saving budget:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan anggaran' }, { status: 500 });
  }
}
