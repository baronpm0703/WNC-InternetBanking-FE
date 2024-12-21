import { handleError } from "@/helpers/ErrorHandler";
import { destination_server } from "@/libs/slices/sliceAuth";
import { UserProfileToken } from "@/Models/User";
import axios from "axios";

// email: ..  pwd: minhbao123
const api = `${destination_server}/accounts/sign-in`;

export const loginAPI = async (email: string, password: string) => {
  try {
    const data = await axios.post<UserProfileToken>(api, {
      email, password
    });
    console.log("Data from be: ", data);
    return data;
  } catch (error) {
    handleError(error)
  }
}

export const registerAPI = async (email: string, password: string) => {
  try {
    const data = await axios.post<UserProfileToken>(api, {
      email, password
    });
  } catch (error) {
    handleError(error)
  }
}