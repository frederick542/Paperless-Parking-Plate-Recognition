import { useEffect } from "react";
import { callApi, verifyCookie } from "../utils/apiUtils";
import { useAuth } from "../utils/context/authContext";
import { useLoading } from "../utils/context/loadingContext";
const handleLogin = async (username: string, password: string) => {
  const user = {
    username: username,
    password: password,
  };
  const response = await callApi("login", "post", user);

  return response;
};

const useVerifyCookie = () => {
  const { startLoading, endLoading } = useLoading();
  const { loginUser, logoutUser } = useAuth();
  useEffect(() => {
    const fetchAuthStatus = async () => {
      startLoading();
      try {
        const authenticated = await verifyCookie();
        if (authenticated) {
          loginUser();
        } else {
          logoutUser();
        }
      } catch (error) {
        logoutUser();
      }
      endLoading();
    };
    fetchAuthStatus();
  }, []);
};

export { handleLogin, useVerifyCookie };
