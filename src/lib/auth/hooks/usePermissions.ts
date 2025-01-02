import { useQuery } from "@/lib/http/hooks/useQuery";
import {
  CAN_APPROVE_CARDS,
  CAN_CLAIM_CARDS,
  CAN_ISSUE_PACKS,
  CAN_SUBMIT_CARDS,
  RoleGroup,
  userGroups,
} from "../constants";
import axios from "axios";
import { GET } from "@/lib/http/constants";
import { useMemo } from "react";
import { useSession } from "@/components/contexts/SessionContext";

export type Permissions = {
  canIssuePacks: boolean;
  canClaimCards: boolean;
  canSubmitCards: boolean;
  canApproveCards: boolean;
};

const UNAUTHENTICATED_PERMISSIONS: Permissions = {
  canIssuePacks: false,
  canClaimCards: false,
  canSubmitCards: false,
  canApproveCards: false,
} as const;

export const usePermissions = (): {
  permissions: Partial<Permissions>;
  groups?: (keyof Readonly<typeof userGroups>)[];
  isLoading: boolean;
} => {
  const { session, loggedIn } = useSession();

  const { payload, isLoading } = useQuery<{
    uid: number;
    groups: (typeof userGroups)[keyof typeof userGroups][];
  }>({
    queryKey: [],
    queryFn: () =>
      axios({
        url: `api/v1/user/permissions`,
        method: GET,
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
    enabled: loggedIn,
  });

  const apiUserGroups = payload?.groups ?? [];

  const permissions = useMemo<Permissions>(() => {
    return {
      canIssuePacks: checkUserHasPermission(apiUserGroups, CAN_ISSUE_PACKS),
      canClaimCards: checkUserHasPermission(apiUserGroups, CAN_CLAIM_CARDS),
      canSubmitCards: checkUserHasPermission(apiUserGroups, CAN_SUBMIT_CARDS),
      canApproveCards: checkUserHasPermission(apiUserGroups, CAN_APPROVE_CARDS),
    };
  }, [apiUserGroups]);

  const groups = useMemo(() => {
    return payload?.groups.flatMap(
      (group) =>
        (Object.keys(userGroups).find(
          (key) =>
            userGroups[key as keyof Readonly<typeof userGroups>] === group
        ) as keyof Readonly<typeof userGroups>) ?? []
    );
  }, [payload?.groups]);

  if (!loggedIn) {
    return {
      permissions: UNAUTHENTICATED_PERMISSIONS,
      groups: undefined,
      isLoading: true,
    };
  }

  return {
    permissions,
    groups,
    isLoading,
  };
};

const checkUserHasPermission = (
  apiUserGroups: (typeof userGroups)[keyof typeof userGroups][],
  requiredPermission: RoleGroup
): boolean =>
  apiUserGroups?.some((group) =>
    requiredPermission.map((role) => userGroups[role]).includes(group)
  );
