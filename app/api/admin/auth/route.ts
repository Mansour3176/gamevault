import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASS   = process.env.ADMIN_PASSWORD ?? 'gamevault2026';
const COOKIE_NAME  = 'gv_admin_session';
const SESSION_TOKEN = 'gv_' + Buffer.from(ADMIN_PASS).toString('base64');

export async function POST(req: NextRequest) {
  const { action, password } = await req.json();

  if (action === 'login') {
    if (password === ADMIN_PASS) {
      const res = NextResponse.json({ success: true });
      res.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 60 * 8, // 8 hours
        path:     '/',
      });
      return res;
    }
    return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 });
  }

  if (action === 'logout') {
    const res = NextResponse.json({ success: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  if (action === 'verify') {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return NextResponse.json({ authenticated: token === SESSION_TOKEN });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
