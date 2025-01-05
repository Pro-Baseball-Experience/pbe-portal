import { useSession } from "@/components/contexts/SessionContext";
import Footer from "@/components/layout/Footer";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();

  const [loginError, setLoginError] = useState<string>("");
  const [shouldRevealPassword, setShouldRevealPassword] =
    useState<boolean>(false);
  const [isRedirectingFromLogin, setIsRedirectingFromLogin] =
    useState<boolean>(false);

  const { loggedIn, handleLogin } = useSession();

  useEffect(() => {
    if (loggedIn && !isRedirectingFromLogin) {
      router.replace("/");
    }
  }, [isRedirectingFromLogin, loggedIn, router]);

  return (
    <>
      <NextSeo title="login" openGraph={{ title: "Login" }} />
      <Header showAuthButtons={false} />

      <Footer />
    </>
  );
}
