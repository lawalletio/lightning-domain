import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET(request: NextRequest, { params }: { params: { pubkey: string } }) {
  let pubkey = params.pubkey;

  // Check if exists
  if (!pubkey) return NextResponse.json({ data: 'Not found' }, { status: 404 });

  pubkey = pubkey.toLowerCase().trim();

  // Find identity record by name
  const identityRecord = await prisma.identity.findUnique({
    where: {
      pubkey,
    },
  });

  // Check if exists
  if (!identityRecord) return NextResponse.json({ data: 'Not found' }, { status: 404 });

  // Respond LUD06
  return NextResponse.json(
    {
      status: 'OK',
      username: identityRecord.name,
      federationId: 'lawallet.ar',
      nodeAlias: 'lacrypta-villanueva',
    },
    { status: 200 },
  );
}
