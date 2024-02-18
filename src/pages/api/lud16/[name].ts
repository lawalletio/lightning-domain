import type { NextApiRequest, NextApiResponse } from "next";
import { generateLUD06 } from "~/lib/utils";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let name = req.query.name as string;

  // Check if exists
  if (!name) {
    res.status(404).send("Not found");
    return;
  }

  name = name.toLowerCase().trim();

  // Find identity record by name
  const identityRecord = await prisma.identity.findUnique({
    where: {
      name,
    },
  });

  // Check if exists
  if (!identityRecord) {
    res.status(404).send("Not found");
    return;
  }

  const pubkey = identityRecord.pubkey;

  // Respond NIP-05
  res.status(200).json(generateLUD06(pubkey));
}
