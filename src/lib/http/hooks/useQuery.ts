import { useQuery as useReactQueryQuery } from "react-query";
import { AxiosResponse } from "axios";
import { ApiError } from "../services/ApiError.service";

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
  error: ApiError;
};

type LogoutResponse = {
  status: "logout";
  message: string;
};

export type ApiResponse<T> =
  | SuccessResponse<T>
  | ErrorResponse<T>
  | LogoutResponse
  | LoadingResponse;

type QueryResponse<T> = ApiResponse<T> & {
  refetch: () => void;
  isLoading: boolean;
  isError: boolean;
};

export const useQuery = <T>({
  queryKey,
  queryFn,
  enabled,
}: {
  queryKey: string | string[];
  queryFn: () => Promise<AxiosResponse<ApiResponse<T>>>;
  enabled?: boolean;
}): QueryResponse<T> => {
  const { data, isLoading, isError, refetch } = useReactQueryQuery({
    queryKey,
    queryFn,
    enabled,
  });

  const apiResponse = data?.data;

  return {
    status: apiResponse?.status,
    payload: apiResponse?.status === "success" ? apiResponse?.payload : null,
    error: apiResponse?.status === "error" ? apiResponse?.error : null,
    refetch,
    isLoading,
    isError,
  } as QueryResponse<T>;
};
