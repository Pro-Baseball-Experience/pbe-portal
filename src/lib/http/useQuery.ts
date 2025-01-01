import { useQuery } from "react-query";
import { ApiResponse } from ".";
import { AxiosResponse } from "axios";

type LoadingResponse = {
  status: "loading";
  payload: null;
};

type SuccessResponse<T> = {
  status: "success";
  payload: T;
};

type ErrorResponse<T> = {
  status: "error";
  payload?: T;
  error: {
    message: string;
    timestamp: Date;
    code: number;
    solution: string;
  };
};

export type ApiResponse<T> =
  | SuccessResponse<T>
  | ErrorResponse<T>
  | LoadingResponse;

type QueryResponse<T> = ApiResponse<T> & {
  refetch: () => void;
  isLoading: boolean;
  isError: boolean;
};

const LOADING_RESPONSE: QueryResponse<null> = {
  status: "loading",
  payload: null,
  refetch: () => {},
  isLoading: true,
  isError: false,
} as const;

export const query = <T>({
  queryKey,
  queryFn,
  enabled,
}: {
  queryKey: string | string[];
  queryFn: () => Promise<AxiosResponse<any, any>>;
  enabled?: boolean;
}): QueryResponse<T> => {
  const { data, isLoading, isError, refetch } = useQuery<{
    data: ApiResponse<T>;
  }>({
    queryKey,
    queryFn,
    enabled,
  });

  if (isLoading) {
    return LOADING_RESPONSE;
  }

  const responseData = data?.data;

  return {
    status: responseData?.status,
    payload: responseData?.status === "success" ? responseData?.payload : null,
    error: responseData?.status === "error" ? responseData?.error : null,
    refetch,
    isLoading,
    isError,
  } as QueryResponse<T>;
};
