import type { NextApiRequest, NextApiResponse } from "next";
import createHandler from "./create";
import getHandler from "./get";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return createHandler(req, res);
    case "GET":
      return getHandler(req, res);
    case "OPTIONS":
      return res.status(200).send("ok");
    default:
      res.status(405).json({ reason: "Method not allowed" });
  }
}
