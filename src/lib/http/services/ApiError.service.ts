export enum ApiErrorCode {
  STANDARD_ERROR_CODE,
  BAD_REQUEST_BODY,
  BAD_REQUEST_QUERY_PARAMS,
  GITHUB_ERROR,
  DATABASE_QUERY_ERROR,
  DATABASE_RESULT_INVALID,
  LOGIN_FAILED,
}

export const StandardSolution =
  "Contact the PBE Trading Cards development team" as const;

export type ApiError = {
  message: string;
  timestamp?: Date;
  code?: ApiErrorCode;
  solution?: string;
};

class ApiErrorService {
  create = ({
    message,
    code,
    solution,
  }: {
    message: string;
    code?: ApiErrorCode;
    solution?: string;
  }): ApiError => {
    return {
      message,
      timestamp: new Date(),
      code: code ?? ApiErrorCode.STANDARD_ERROR_CODE,
      solution: solution ?? StandardSolution,
    };
  };
}

export const apiErrorService = new ApiErrorService();
