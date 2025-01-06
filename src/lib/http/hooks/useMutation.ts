import {
  MutationFunction,
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation as useReactQueryMutation,
} from "react-query";
import { ApiResponse } from "./useQuery";
import { ApiError } from "../services/ApiError.service";

type MutationResponse<D, V> = {
  mutate: UseMutateFunction<ApiResponse<D>, ApiError, V, unknown>;
  mutateAsync: UseMutateAsyncFunction<ApiResponse<D>, ApiError, V, unknown>;
  isLoading: boolean;
  isError: boolean;
};

export const useMutation = <D, V>({
  mutationFn,
  onSuccess,
  onError,
}: {
  mutationFn: MutationFunction<ApiResponse<D>, V>;
  onSuccess?: (data: ApiResponse<D>) => void;
  onError?: (data: ApiError) => void;
}): MutationResponse<D, V> => {
  const { mutate, mutateAsync, isLoading, isError } = useReactQueryMutation(
    mutationFn,
    { onSuccess, onError }
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
  };
};
