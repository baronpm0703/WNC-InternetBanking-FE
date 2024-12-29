import { useAppSelector } from "@/libs/hooks";
import React, { useEffect } from "react";

export const DashboardHeader: React.FC = () => {
  const { accountInfo } = useAppSelector((state) => state.account);
  useEffect(() => {console.log("Role: ",accountInfo.role)}, [accountInfo.role])
  return (
    <header className="flex items-center justify-center w-full px-6 py-3 rounded-lg relative">
      {
        accountInfo.role === "Customer" ? (
          <>
            {/* Search Bar */}
            <div className="relative w-3/7 p-0.5 bg-gradient-to-tr from-[#B9FF66] to-[#9DE8EE] rounded-full">
              <div className="w-full bg-black rounded-full">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m-5.2 2.35a7.5 7.5 0 1 0-7.5-7.5 7.5 7.5 0 0 0 7.5 7.5z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search for anything"
                  className="w-full py-2.5 pl-12 pr-4 rounded-full bg-transparent text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 transition duration-200"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="h-9"/>
        )
      }
      <div className="w-1/8" />
      {/* Icons Section */}
      <div className="flex flex-row-reverse items-center w-3/7 absolute right-10">
        {/* Profile Section */}
        <div className="relative bg-gradient-to-tr from-[#B9FF66] to-[#9DE8EE] rounded-full p-0.5 cursor-pointer">
          <div className="flex rounded-full items-center space-x-2 px-3 py-1 bg-black hover:bg-gray-800 group">
            <span className="text-gray-300">Profile</span>
            <img
              src="/IBP/logo.svg"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative bg-gradient-to-tr from-[#B9FF66] to-[#9DE8EE] rounded-md p-0.5 me-5">
          <button className=" bg-[#181818] rounded-md p-2 hover:bg-gray-500 transition duration-300 outline-none">
            <img src="/IBP/notification_logo.svg" className="w-5 h-5" />
          </button>

        </div>


      </div>
    </header >
  );
};
