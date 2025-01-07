import middleware from "@/lib/database/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { HTTP_METHODS } from "@/lib/http/constants";
import { usersQuery } from "@/lib/database/connect";
import SQL from "sql-template-strings";
import { ApiResponse } from "@/lib/http/hooks/useQuery";
import { StatusCodes } from "http-status-codes";
import {
  ApiErrorCode,
  apiErrorService,
} from "@/lib/http/services/ApiError.service";
import { v4 as uuid } from "uuid";
import { signToken } from "@/lib/auth/jsonWebToken";
import { getRefreshTokenExpirationDate } from "@/lib/auth/refreshToken";

const cors = Cors({
  methods: [HTTP_METHODS.POST],
});

type LoginData = {
  userId: number;
  usergroup: number;
  accessToken: string;
  refreshToken: string;
};

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<LoginData>>
): Promise<void> {
  await middleware(req, res, cors);

  // TODO: select query to find if a user exists with the provided username
  const userExistsQuery = await usersQuery<{
    uid: number;
    username: string;
    password: string;
    salt: string;
    usergroup: number;
    displaygroup: string;
    additionalgroups: number[];
  }>(SQL``);

  if ("error" in userExistsQuery) {
    console.error("Server connection failed");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      error: apiErrorService.create({
        message: "Server connection failed",
        code: ApiErrorCode.DATABASE_QUERY_ERROR,
      }),
    });
    return;
  }

  if (userExistsQuery.total > 1) {
    console.error("Multiple users with same username");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      error: apiErrorService.create({
        message: "Multiple users with same username",
        code: ApiErrorCode.DATABASE_RESULT_INVALID,
      }),
    });
    return;
  }

  if (userExistsQuery.total === 1) {
    console.error("Invalid username or password");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      error: apiErrorService.create({
        message: "Invalid username or password",
        code: ApiErrorCode.LOGIN_FAILED,
      }),
    });
    return;
  }

  const [user] = userExistsQuery.rows;

  // TODO: check for banned users

  // TODO: check for users that have not been activated yet

  const accessToken: string = signToken(user.uid);
  const refreshToken: string = uuid();
  const expiresAt: string = getRefreshTokenExpirationDate();

  // TODO: insert a row into the refreshTokens database, check for duplicate inserts
  await usersQuery(SQL``);

  res.status(StatusCodes.OK).json({
    status: "success",
    payload: {
      userId: user.uid,
      usergroup: user.usergroup,
      accessToken,
      refreshToken,
    },
  });
}
