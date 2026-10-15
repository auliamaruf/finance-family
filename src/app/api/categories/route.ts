import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const where: any = {};
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type = 'EXPENSE', budgetRule = 'NEEDS', icon = 'Tag', color = '#3B82F6' } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        budgetRule,
        icon,
        color,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat kategori' }, { status: 500 });
  }
}
