import middleware from "@/lib/database/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { HTTP_METHODS } from "@/lib/http/constants";
import { usersQuery } from "@/lib/database/connect";
import SQL from "sql-template-strings";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@/lib/http/hooks/useQuery";
import {
  convertRefreshTokenExpirationDate,
  getRefreshTokenExpirationDate,
} from "@/lib/auth/refreshToken";
import { signToken } from "@/lib/auth/jsonWebToken";
import { v4 as uuid } from "uuid";

type TokenData = {
  userId: number;
  accessToken: string;
  refreshToken: string;
};

const cors = Cors({
  methods: [HTTP_METHODS.POST],
});

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TokenData>>
): Promise<void> {
  await middleware(req, res, cors);

  // TODO: search for existing refresh tokens
  const refreshTokenExistsQuery = await usersQuery<{
    uid: number;
    invalid: 0 | 1;
    expiresAt: string;
  }>(SQL``);

  if ("error" in refreshTokenExistsQuery) {
    console.error("Server connection failed");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "logout",
      message: "Server connection failed",
    });
    return;
  }

  if (refreshTokenExistsQuery.total === 0) {
    console.error("No refresh token found");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "logout",
      message: "No refresh token found",
    });
    return;
  }

  const [user] = refreshTokenExistsQuery.rows;

  if (
    convertRefreshTokenExpirationDate(user.expiresAt) < Date.now() ||
    user.invalid
  ) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: "logout",
      message: "Refresh token expired",
    });
    return;
  }

  const accessToken: string = signToken(user.uid);
  const refreshToken: string = uuid();
  const expiresAt: string = getRefreshTokenExpirationDate();

  // TODO: insert a row into the refreshTokens database, check for duplicate inserts
  await usersQuery(SQL``);

  res.status(StatusCodes.OK).json({
    status: "success",
    payload: {
      userId: user.uid,
      accessToken,
      refreshToken,
    },
  });
  return;
}
