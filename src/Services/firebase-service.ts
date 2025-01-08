import { getToken } from "firebase/messaging";
import { messaging } from "../config/firebase-config";
import { root } from "@/libs/store";
import { addToken } from "@/libs/slices/sliceTask";
import apiClient from "@/helper/apiClient";
const VITE_VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

export const requestPermission = async () => {
  //requesting permission using Notification API
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("Notification permission granted.");
    try {
      const token = await getToken(messaging, {
        vapidKey: VITE_VAPID_KEY,
      });
      //We can send token to server
    console.log("Token generated : ", token);
    // Call Catche token
    const respsonse = await apiClient.get("debt/update-notification-token", {params: {token}});
    if (respsonse.status === 200) {
      console.log("Token sent to server");
    } else console.log("Failed to send token to server");
    root.dispatch(addToken(token));
    } catch (error) {
      console.log("Error in generating token: ", error);
    }
  } else if (permission === "denied") {
    console.log("Notification permission denied.");
    //notifications are blocked
    alert("You denied for the notification");
  }
};
