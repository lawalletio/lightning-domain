import { NextResponse } from 'next/server';
import { generateVoucherEvent, publishEvent } from '~/lib/events';
import { prisma } from '~/server/db';

const voucherPrivateKey: string = process.env.NOSTR_VOUCHER_PRIVATE_KEY ?? '';
type VoucherClaim = { name: string; code: number };

export async function POST(request: Request) {
  try {
    const voucherClaim: VoucherClaim = (await request.json()) as unknown as VoucherClaim;

    await prisma.$transaction(async (tx) => {
      const identity = await tx.identity.findUnique({
        where: { name: voucherClaim.name },
      });
      if (null === identity) throw new Error('Invalid identity');
      if (null === identity.voucherId) throw new Error('No voucher requested');

      const existingVoucher = await tx.voucher.findUnique({
        where: { id: identity.voucherId },
      });
      if (null === existingVoucher) throw new Error('No voucher found');
      if (existingVoucher.claimed) throw new Error('Already claimed');
      if (existingVoucher.verificationCode !== Number(voucherClaim.code)) throw new Error('Invalid code');

      try {
        await tx.voucher.update({
          where: {
            id: identity.voucherId,
          },
          data: {
            claimed: true,
          },
        });
      } catch (e: unknown) {
        throw new Error('Failed to update');
      }

      try {
        await publishEvent(generateVoucherEvent(identity.pubkey), voucherPrivateKey);
      } catch (e) {
        throw new Error('Failed to broadcast transaction');
      }

      return NextResponse.json({ message: 'OK' }, { status: 200 });
    });
  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
