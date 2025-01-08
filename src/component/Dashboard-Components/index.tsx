import { Outlet } from "react-router-dom";
import { DashboardNavBar } from "./navBar";
import { DashboardHeader } from "./header";

import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { useEffect } from "react";
import { fetchAccountInfo, fetchRecipients, fetchCustomerAccount, fetchEmployeeAccount } from "@/libs/slices/sliceAccount";
import timeStampHelper from "@/helper/convertTimeStamp";
import { requestPermission } from "@/Services/firebase-service";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/config/firebase-config";
import { toast } from "react-toastify";
import ToastMessage from "../Resusable/toastComponent";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { error, accountInfo } = useAppSelector(state => state.account);
  const { fcmToken } = useAppSelector(state => state.task);

  useEffect(() => {
    console.log("Fetching Account Info");
    if (!accountInfo.name) {
      console.log("Empty Account Info...");
      dispatch(fetchAccountInfo());
      dispatch(fetchCustomerAccount());
      dispatch(fetchEmployeeAccount());
    }
  }, [accountInfo]);
  useEffect(() => {
    //Convert created string to date
    const date = timeStampHelper.formatTimestamp(accountInfo.created_at || "");
    console.log("Account Info: ", accountInfo, date);
  }, [accountInfo.name])

  useEffect(() => {
    if (!accountInfo.recipient_list) {
      console.log("Fetching recipient list...");
      dispatch(fetchRecipients());
    }
  }, [dispatch, accountInfo.recipient_list]);

  useEffect(() => {
    if (!fcmToken && accountInfo.name && accountInfo.role === "Customer") {
      console.log("Requesting permission...");
      requestPermission();
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload.data);
        // if (payload.notification && payload.notification.title === "Paid") {
        //   toast.success(<ToastMessage title={payload.notification?.body || ""} payload={payload.data || {}} />);
        // }
        toast.success(<ToastMessage title={payload.notification?.body || ""} payload={payload.data || {}} />);
        // Show notification or update UI
      });
    }
  }, [fcmToken, accountInfo])
  return (
    <div className="w-screen h-screen py-8 px-2 sm:px-3 bg-[#181818] relative">
      <div className="flex w-full h-full justify-center bg-cover bg-no-repeat">
        {/* Sidebar */}
        <DashboardNavBar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ">
          {/* Header */}
          <DashboardHeader />

          {/* <button type="button" onClick={() => {
            dispatch(submitRefreshToken())
          }}>Click Me</button> */}
          {/* Content Outlet */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}