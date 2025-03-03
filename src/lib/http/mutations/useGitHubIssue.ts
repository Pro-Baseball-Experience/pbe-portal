import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useMutation } from "../hooks/useMutation";
import { POST } from "@/lib/http/constants";
import {
  errorToastOptions,
  successToastOptions,
} from "@/lib/toast/toastOptions";

export type GithubIssueData = {
  title: string;
  body: string;
  label: "bug" | "story" | null;
};

export const useGitHubIssue = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const toast = useToast();
  return useMutation<{ newIssueUrl: string }, GithubIssueData>({
    mutationFn: (requestData: GithubIssueData) =>
      axios({
        method: POST,
        url: "/api/v3/github/issue",
        data: requestData,
      }),
    onSuccess: (data) => {
      toast({
        title: "Ticket Submitted",
        description: data?.payload?.newIssueUrl ?? null,
        ...successToastOptions,
      });
      if (onSuccess) onSuccess();
    },
    onError: (data) => {
      toast({
        title: "Error Submitting Ticket",
        description: data?.payload?.solution ?? null,
        ...errorToastOptions,
      });
      if (onError) onError();
    },
  });
};
