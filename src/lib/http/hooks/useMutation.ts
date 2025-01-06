import {
  MutationFunction,
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation as useReactQueryMutation,
} from "react-query";
import { ApiResponse } from "./useQuery";
import { ApiError } from "../services/ApiError.service";

type MutationResponse<D, V> = {
  mutate: UseMutateFunction<D, unknown, V, unknown>;
  mutateAsync: UseMutateAsyncFunction<D, unknown, V, unknown>;
  isLoading: boolean;
  isError: boolean;
};

const LOADING_MUTATION: MutationResponse<any, any> = {
  mutate: () => null,
  mutateAsync: async () => null,
  isLoading: true,
  isError: false,
};

export const useMutation = <D, V>({
  mutationFn,
  onSuccess,
  onError,
}: {
  mutationFn: MutationFunction<D, V>;
  onSuccess?: (data: ApiResponse<D>) => void;
  onError?: (data: ApiError) => void;
}): MutationResponse<D, V> => {
  const { mutate, mutateAsync, isLoading, isError } = useReactQueryMutation(
    mutationFn,
    {
      onSuccess,
      onError,
    }
  );

  if (isLoading) {
    return LOADING_MUTATION;
  }

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
  };
};
