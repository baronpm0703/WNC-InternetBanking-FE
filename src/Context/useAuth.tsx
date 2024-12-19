import { UserProfile } from "@/Models/User";
import { loginAPI } from "@/Services/AuthServices";
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  loginUser: (email: string, password: string) => void;
  logOut: () => void;
  isLoggedIn: () => boolean;
}

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({children}: Props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      setUser(JSON.parse(user));
      setToken(token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    }
    setIsReady(true);
  }, [token]);

  const loginUser = async (email: string, password: string) => {
    await loginAPI(email, password)
      .then((res) => {
        if (res) {
          localStorage.setItem("token", JSON.stringify(res?.data.token));
          setToken(res?.data.token!);
          toast.success("Login Success!");
          navigate("/");
        }
      })
      .catch((e) => toast.warning("Server error occured"));
  };

  const isLoggedIn = () => {
    return !!user;
  }
  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    navigate("/");
  };

  return  (
    <UserContext.Provider value={{ loginUser, user, token, logOut, isLoggedIn }}>
      {isReady ? children : null}
    </UserContext.Provider>
  )
}

export const useAuth =  () =>  React.useContext(UserContext);