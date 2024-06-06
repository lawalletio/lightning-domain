import { NextRequest, NextResponse } from 'next/server';
import { AUTOCREATE_NONCE } from '~/lib/envs';
import { prisma } from '~/server/db';

export async function GET(request: NextRequest, { params }: { params: { nonce: string } }) {
  let nonce = params.nonce;

  // Check if exists
  if (!nonce) return NextResponse.json({ data: 'Not found' }, { status: 404 });

  // Return true if its the autocreate nonce
  if (AUTOCREATE_NONCE && AUTOCREATE_NONCE === nonce) return NextResponse.json({ status: true }, { status: 200 });

  // Find identity record by name
  const nonceRecord = await prisma.nonce.findUnique({
    where: {
      nonce,
    },
  });

  // Check if exists
  if (!nonceRecord) return NextResponse.json({ status: false, error: 'Not found' }, { status: 404 });

  // Check if burned
  if (nonceRecord.burned) {
    return NextResponse.json({ status: false, error: 'Nonce has been burned' }, { status: 410 });
  } else {
    return NextResponse.json({ status: true }, { status: 200 });
  }
}
