import {  Outlet } from "react-router-dom";
import { DashboardNavBar } from "./navBar";
import { DashboardHeader } from "./header";

import { useAppDispatch } from "@/libs/hooks";
import { submitRefreshToken } from "@/libs/slices/sliceAuth";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  return (
    <div className="w-screen h-screen py-8 px-2 sm:px-3 bg-[#181818] relative">
      <div className="flex w-full h-full justify-center bg-cover bg-no-repeat">
        {/* Sidebar */}
        <DashboardNavBar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ">
          {/* Header */}
          <DashboardHeader />

          <button type="button" onClick={() => {
            dispatch(submitRefreshToken())
          }}>Click Me</button>
          {/* Content Outlet */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
