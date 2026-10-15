import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil rekening' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type = 'BANK', owner = 'JOINT', balance = 0, accountNumber, color = '#3B82F6', icon = 'Wallet', isDefault = false } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama rekening / dompet wajib diisi' }, { status: 400 });
    }

    if (isDefault) {
      // Clear previous default
      await prisma.account.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await prisma.account.create({
      data: {
        name: name.trim(),
        type,
        owner,
        balance: parseFloat(balance) || 0,
        accountNumber: accountNumber?.trim() || null,
        color,
        icon,
        isDefault,
      },
    });

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat rekening' }, { status: 500 });
  }
}
