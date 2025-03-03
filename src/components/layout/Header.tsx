import { useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { useCookie } from "@/lib/http/hooks/useCookie";
import { COOKIE_CONFIG, GET } from "@/lib/http/constants";
import { useRouter } from "next/router";
import { useQuery } from "@/lib/http/hooks/useQuery";
import axios from "axios";

export default function Header({ showAuthButtons = true }) {
  const { session, loggedIn, handleLogout } = useSession();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [uid] = useCookie(COOKIE_CONFIG.userId);
  const router = useRouter();

  const {} = useQuery({
    queryKey: ["user", session?.token],
    queryFn: () =>
      axios({
        url: "/api/v1/user",
        method: GET,
        headers: { Authorization: `Bearer ${session?.token}` },
      }),
    enabled: loggedIn,
  });

  return <header></header>;
}
