import { NextResponse } from 'next/server';
import { SIGNUP_ENABLED, SIGNUP_MSATS_PRICE } from '~/lib/envs';

export async function GET() {
  return NextResponse.json({ enabled: SIGNUP_ENABLED, milisatoshis: SIGNUP_MSATS_PRICE }, { status: 200 });
}
