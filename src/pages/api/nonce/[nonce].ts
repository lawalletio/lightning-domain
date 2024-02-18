import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const nonce = req.query.nonce as string;

  // Check if exists
  if (!nonce) {
    res.status(404).send("Not found");
    return;
  }

  // Find identity record by name
  const nonceRecord = await prisma.nonce.findUnique({
    where: {
      nonce,
    },
  });

  // Check if exists
  if (!nonceRecord) {
    res.status(404).send({ status: false, error: "Not found" });
    return;
  }

  // Check if burned
  if (nonceRecord.burned) {
    res.status(410).send({ status: false, error: "Nonce has been burned" });
    return;
  } else {
    res.status(200).send({ status: true });
  }
}
