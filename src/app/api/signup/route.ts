import { NextResponse } from 'next/server';
import { SIGNUP_ENABLED, SIGNUP_MSATS_PRICE } from '~/lib/envs';

export async function GET() {
  if (SIGNUP_MSATS_PRICE < 1000) return NextResponse.json({ enabled: 0, milisatoshis: 0 }, { status: 200 });

  return NextResponse.json({ enabled: SIGNUP_ENABLED, milisatoshis: SIGNUP_MSATS_PRICE }, { status: 200 });
}
