import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { formatTanggal, ROLE_LABELS, BUDGET_RULE_LABELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: any = {};
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
      orderBy: { date: 'asc' },
    });

    const rows = transactions.map((t, idx) => ({
      No: idx + 1,
      Tanggal: formatTanggal(t.date, 'long'),
      Tipe: t.type === 'INCOME' ? 'Pemasukan' : t.type === 'EXPENSE' ? 'Pengeluaran' : 'Transfer',
      Keterangan: t.title,
      Nominal: t.amount,
      'Pelaku Transaksi': ROLE_LABELS[t.performedBy]?.label || t.performedBy,
      Kategori: t.category?.name || '-',
      'Alokasi 50/30/20': BUDGET_RULE_LABELS[t.category?.budgetRule || 'OTHER']?.label || '-',
      'Sumber Dana': t.account?.name || '-',
      'Tujuan Transfer': t.toAccount?.name || '-',
      Catatan: t.notes || '',
    }));

    // Create workbook & worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi Keuangan');

    // Generate buffer
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = month && year
      ? `Laporan_Keuangan_${year}_${month}.xlsx`
      : `Laporan_Keuangan_Semua.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat file export' }, { status: 500 });
  }
}
