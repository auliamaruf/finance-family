import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body; // Array of { id, balance, name?, owner?, type?, accountNumber? }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: false, error: 'Daftar pembaruan rekening kosong' }, { status: 400 });
    }

    const transactionOps = updates.map((acc: any) =>
      prisma.account.update({
        where: { id: acc.id },
        data: {
          ...(acc.balance !== undefined ? { balance: parseFloat(acc.balance) || 0 } : {}),
          ...(acc.name ? { name: acc.name.trim() } : {}),
          ...(acc.owner ? { owner: acc.owner } : {}),
          ...(acc.type ? { type: acc.type } : {}),
          ...(acc.accountNumber !== undefined ? { accountNumber: acc.accountNumber?.trim() || null } : {}),
        },
      })
    );

    const updatedAccounts = await prisma.$transaction(transactionOps);

    return NextResponse.json({
      success: true,
      message: `${updatedAccounts.length} rekening berhasil diperbarui`,
      data: updatedAccounts,
    });
  } catch (error) {
    console.error('Error in batch account update:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui rekening' }, { status: 500 });
  }
}
