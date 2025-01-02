import { COOKIE_CONFIG, POST } from "@/lib/http/constants";
import { useCookie } from "@/lib/http/hooks/useCookie";
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StatusCodes } from "http-status-codes";

type Session = {
  token: string;
  userId: string;
};

export const SessionContext = createContext<{
  session: Session | null;
  loggedIn: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleRefresh: () => Promise<void>;
  handleLogout: () => void;
}>({
  session: null,
  loggedIn: false,
  isLoading: true,
  setSession: () => {},
  handleLogin: () => Promise.resolve(),
  handleRefresh: () => Promise.resolve(),
  handleLogout: () => {},
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [, setUserID, deleteUserID] = useCookie(COOKIE_CONFIG.userId);
  const [, setRefreshToken, deleteRefreshToken, getRefreshToken] = useCookie(
    COOKIE_CONFIG.refreshToken
  );

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      const response = await axios({
        method: POST,
        url: "/api/v1/auth/login",
        data: { username, password },
      });

      if (response.status !== StatusCodes.OK || response.data.error) {
        throw new Error(response.data);
      }

      setSession({
        token: response.data.payload.accessToken,
        userId: response.data.payload.userid,
      });

      setRefreshToken(response.data.payload.refreshToken);
      setUserID(response.data.payload.userid);
      setIsLoading(false);

      return;
    },
    [setUserID]
  );

  const handleLogout = useCallback(() => {
    setSession(null);
    deleteRefreshToken(COOKIE_CONFIG.refreshToken);
    deleteUserID();
  }, [deleteRefreshToken, deleteUserID]);

  const isRefreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current === true) {
      setTimeout(() => (isRefreshingRef.current = false), 1000);
      return;
    }

    isRefreshingRef.current = true;

    const response = await axios({
      method: POST,
      url: "/api/v1/auth/token",
      data: {
        refreshToken: getRefreshToken(),
      },
    });

    if (response.status !== StatusCodes.OK) {
      handleLogout();
      setIsLoading(false);
      isRefreshingRef.current = false;
      return;
    }

    if (response.data.status === "logout") {
      handleLogout();
      setIsLoading(false);
      isRefreshingRef.current = false;
      return;
    }

    setSession({
      token: response.data.payload.accessToken,
      userId: response.data.payload.userid,
    });
    setIsLoading(false);
    isRefreshingRef.current = false;

    setRefreshToken(response.data.payload.refreshToken);
    setUserID(response.data.payload.userid);
  }, [handleLogout]);

  useEffect(() => {
    if (!session) {
      if (getRefreshToken()) {
        handleRefresh();
        return;
      }
      setIsLoading(false);
    }
  }, []);

  const loggedIn = useMemo(() => !!session, [session]);

  return (
    <SessionContext.Provider
      value={{
        session,
        loggedIn,
        isLoading,
        setSession,
        handleLogin,
        handleRefresh,
        handleLogout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
