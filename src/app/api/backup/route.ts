import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(process.cwd(), 'data', 'finance.db'),
    ];

    let dbPath = candidatePaths.find((p) => fs.existsSync(p));

    if (!dbPath) {
      return NextResponse.json({ success: false, error: 'File database tidak ditemukan' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `finance_backup_${dateStr}.db`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/x-sqlite3',
      },
    });
  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json({ success: false, error: 'Gagal mendownload backup database' }, { status: 500 });
  }
}
