import middleware from "@/lib/database/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { HTTP_METHODS } from "@/lib/http/constants";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@/lib/http/hooks/useQuery";
import {
  ApiErrorCode,
  apiErrorService,
} from "@/lib/http/services/ApiError.service";
import { Octokit } from "octokit";

const REPOSITORY_OWNER = "GuthrieW" as const;
const REPOSITORY_NAME = "pbe-trading-cards" as const;

const cors = Cors({
  methods: [HTTP_METHODS.POST],
});

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ newIssueUrl: string }>>
): Promise<void> {
  await middleware(req, res, cors);

  const { title, body, label } = req.body;

  if (!title || !body || !label) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      error: apiErrorService.create({
        message: "Unable to create new ticket",
        code: ApiErrorCode.BAD_REQUEST_BODY,
        solution: "Provide a valid title, body and label for your new ticket",
      }),
    });
    return;
  }

  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_ISSUES_TOKEN}`,
  });

  const githubResponse = await octokit.request(
    `POST /repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/issues`,
    {
      owner: REPOSITORY_OWNER,
      repo: REPOSITORY_NAME,
      title,
      body,
      assignees: [REPOSITORY_OWNER],
      labels: [label],
      headers: {
        "Content-Type": "application/json",
        accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if ("status" in githubResponse && githubResponse.status === 201) {
    res.status(StatusCodes.OK).json({
      status: "success",
      payload: { newIssueUrl: githubResponse?.data?.html_url },
    });
  } else {
    res.status(githubResponse.status).json({
      status: "error",
      error: {
        message: githubResponse?.data?.message,
        code: ApiErrorCode.GITHUB_ERROR,
        solution: "Contact the PBE Trading Cards development team",
      },
    });
  }
  return;
}
