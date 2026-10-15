import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  verifyPin,
  createSessionToken,
  verifySessionToken,
  getSecurityConfig,
  saveSecurityConfig,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    const isAuthenticated = verifySessionToken(sessionCookie);
    const config = getSecurityConfig();

    return NextResponse.json({
      success: true,
      authenticated: isAuthenticated,
      pinEnabled: config.pinEnabled,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, rememberMe = true } = body;

    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN wajib diisi' }, { status: 400 });
    }

    const isValid = verifyPin(pin);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'PIN tidak sesuai' }, { status: 401 });
    }

    const { token, maxAge } = createSessionToken(rememberMe);

    const response = NextResponse.json({
      success: true,
      message: 'Akses berhasil diverifikasi',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Layar terkunci / Sesi berakhir',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set({
      name: 'keuangan_kita_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengunci sesi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPin, newPin, pinEnabled } = body;

    const config = getSecurityConfig();

    // If changing PIN, verify current PIN first
    if (newPin) {
      if (!currentPin || !verifyPin(currentPin)) {
        return NextResponse.json({ success: false, error: 'PIN lama tidak sesuai' }, { status: 400 });
      }

      if (!/^\d{6}$/.test(newPin.trim())) {
        return NextResponse.json({ success: false, error: 'PIN baru harus terdiri dari 6 angka' }, { status: 400 });
      }

      const success = saveSecurityConfig(newPin, pinEnabled !== false);
      if (!success) {
        return NextResponse.json({ success: false, error: 'Gagal menyimpan PIN baru' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'PIN keamanan berhasil diperbarui',
      });
    }

    // If only toggling enabled/disabled
    if (pinEnabled !== undefined) {
      if (!currentPin || !verifyPin(currentPin)) {
        return NextResponse.json({ success: false, error: 'PIN saat ini wajib diisi' }, { status: 400 });
      }
      saveSecurityConfig(config.pin, pinEnabled);
      return NextResponse.json({
        success: true,
        message: `Proteksi PIN ${pinEnabled ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
  } catch (error) {
    console.error('Error updating PIN:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui pengaturan PIN' }, { status: 500 });
  }
}
