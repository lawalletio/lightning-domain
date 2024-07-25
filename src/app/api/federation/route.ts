import { NextResponse } from 'next/server';
import federationConfig from '~/constants/federationConfig.json';

export async function GET() {
  return NextResponse.json(federationConfig, { status: 200 });
}
