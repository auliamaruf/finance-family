import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const goals = await prisma.financialGoal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    console.error('Error fetching financial goals:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil target tabungan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, targetAmount, currentAmount = 0, deadline, owner = 'JOINT', notes } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama target tabungan wajib diisi' }, { status: 400 });
    }

    const goal = await prisma.financialGoal.create({
      data: {
        title: title.trim(),
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline ? new Date(deadline) : null,
        owner,
        notes: notes?.trim() || null,
        isCompleted: (parseFloat(currentAmount) || 0) >= (parseFloat(targetAmount) || 0),
      },
    });

    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat target tabungan' }, { status: 500 });
  }
}
