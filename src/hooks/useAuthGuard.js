

import { useEffect } from "react";
import { useRouter } from "next/router";
import { isTokenExpired } from "../../utils/auth";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      // wipe stale data
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // redirect
      router.replace("/");
    }
  }, [router]);
}

