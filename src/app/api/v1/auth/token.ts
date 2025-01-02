import middleware from "@/lib/database/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { HTTP_METHODS } from "@/lib/http/constants";

const cors = Cors({
  methods: [HTTP_METHODS.POST],
});

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await middleware(req, res, cors);
}
