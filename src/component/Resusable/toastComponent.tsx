import { cn } from "@/lib/utils";
import React from "react";
import { useNavigate } from "react-router-dom";

const ToastMessage: React.FC<{ title: string; payload: any }> = ({ title, payload }) => {
  const navigate = useNavigate();
  console.log("Data: ", payload, title);
  const handleNavigate = () => {
    console.log("Navigate to debt page");
    navigate(`/dashboard/debt-reminders?debt_id=${payload.debt_id ? payload.debt_id : ""}`);
  }
  return (
    <div
      className={cn(
        "flex flex-col items-center space-x-4 p-4 w-full justify-between",
        "animate-in fade-in"
      )}
    >
      <div className="flex-1 text-gray-900 text-sm">{title}</div>
      <div className="w-full">
        <button
          onClick={handleNavigate}
          className="text-gray-400 hover:text-gray-600 focus:outline-none border-black float-right"
        >
          View Detail
        </button>
      </div>

    </div>
  )
}

export default ToastMessage;