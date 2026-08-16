import { cookies } from 'next/headers';
import { COOKIE_ADMIN } from '@/libs/adminAuth';

export async function POST() {
  (await cookies()).delete(COOKIE_ADMIN);
  return Response.json({ ok: true });
}
