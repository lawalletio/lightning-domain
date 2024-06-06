import SG from '@sendgrid/mail';
import { randomInt } from 'crypto';

import blacklist from '~/constants/blacklist.json';
import { verificationCode as verificationCodeEmail } from '~/constants/emails.json';
import { prisma } from '~/server/db';
import type { Voucher } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IContent, sendEmergencyEmail } from '~/lib/mail';
import { NextResponse } from 'next/server';
import { SENGRID_API_KEY, VOUCHER_VERIFICATION_CODE_LENGTH } from '~/lib/envs';

const verificationCodeData: { subject: string; html: string } = verificationCodeEmail as {
  subject: string;
  html: string;
};

const U_CONSTRAINT_VIOLATION = 'P2002';

SG.setApiKey(SENGRID_API_KEY);

type VoucherRequest = { name: string; email: string };

// Ref: https://stackoverflow.com/a/20204811
const tldRegex = /(?=^.{4,253}$)(^((?!-)[a-z0-9-]{0,62}[a-z0-9]\.)+[a-z]{2,63}$)/i;
const usrRegex = /^[a-z0-9_.+-]+$/i;

const blacklistedDomains = new Set(blacklist);

function cleanupEmail(email: string): { cleanUser: string; cleanDomain: string; normal: string } | null {
  const [userParts, ...domainParts] = email.split('@');
  const user = userParts ?? '';
  const domain = domainParts.join('@');

  if (!usrRegex.test(user) || !tldRegex.test(domain)) {
    return null;
  }

  return {
    cleanUser: (user.split('+')[0] ?? '').split('.').join('').toLowerCase(),
    cleanDomain: domain.toLowerCase(),
    normal: email,
  };
}

function replaceValidationCode(text: string, code: number): string {
  return text.replace('%VERIFICATION_CODE%', code.toString().padStart(VOUCHER_VERIFICATION_CODE_LENGTH, '0'));
}

export async function POST(request: Request) {
  try {
    const voucherRequest: VoucherRequest = (await request.json()) as unknown as VoucherRequest;

    await prisma.$transaction(async (tx) => {
      const identity = await tx.identity.findUnique({
        where: { name: voucherRequest.name },
      });
      if (null === identity) throw new Error('Invalid identity');

      const email: {
        cleanUser: string;
        cleanDomain: string;
        normal: string;
      } | null = cleanupEmail(voucherRequest.email);

      if (null === email) throw new Error('Invalid email');
      if (email.cleanDomain in blacklistedDomains) throw new Error('Invalid domain');

      const cleanEmail = `${email.cleanUser}@${email.cleanDomain}`;
      const verificationCode = randomInt(
        10 ** (VOUCHER_VERIFICATION_CODE_LENGTH - 1),
        10 ** VOUCHER_VERIFICATION_CODE_LENGTH - 1,
      );

      const existingVoucher: Voucher | null =
        null !== identity.voucherId ? await tx.voucher.findUnique({ where: { id: identity.voucherId } }) : null;

      try {
        if (null === existingVoucher) {
          const createdVoucher: Voucher = await tx.voucher.create({
            data: {
              email: email.normal,
              cleanEmail: cleanEmail,
              verificationCode: verificationCode,
            },
          });
          await tx.identity.update({
            where: {
              pubkey: identity.pubkey,
            },
            data: {
              voucherId: createdVoucher.id,
            },
          });
        } else {
          if (existingVoucher.claimed) throw new Error('Already claimed');
          await tx.voucher.update({
            where: {
              id: existingVoucher.id,
            },
            data: {
              email: email.normal,
              cleanEmail: cleanEmail,
              verificationCode: verificationCode,
            },
          });
        }
      } catch (e: unknown) {
        if (e instanceof PrismaClientKnownRequestError && e.code === U_CONSTRAINT_VIOLATION) {
          throw new Error('Duplicate email');
        } else {
          throw new Error('Failed to upsert');
        }
      }

      try {
        const emailData: IContent = {
          from: 'no-reply@lacrypta.com.ar',
          to: email.normal,
          html: replaceValidationCode(verificationCodeData.html, verificationCode),
          text: '',
          subject: replaceValidationCode(verificationCodeData.subject, verificationCode),
        };

        await sendEmergencyEmail(emailData);

        // await SG.send({
        //   to: email.normal,
        //   from: "no-reply@lawallet.ar",
        //   subject: replaceValidationCode(verificationCodeData.subject, verificationCode),
        //   html: replaceValidationCode(verificationCodeData.html, verificationCode),
        // });
      } catch (e: unknown) {
        // throw new Error("Failed to send email");
      }

      return NextResponse.json({ message: 'OK' }, { status: 200 });
    });
  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
