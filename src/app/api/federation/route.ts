import { NextResponse } from 'next/server';
import { federationConfig } from '~/lib/federation';

export async function GET() {
  return NextResponse.json(federationConfig, { status: 200 });
}
