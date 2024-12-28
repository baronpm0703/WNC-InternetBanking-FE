import { useAppDispatch } from "@/libs/hooks";
import { logout } from "@/libs/slices/sliceAuth";
import React from "react";
import { NavLink } from "react-router-dom";

export const DashboardNavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const handleLogOut = () => {
    console.log("Logout");
    dispatch(logout());
  }
  return (
    <aside className="bg-transparent text-white w-2/7 h-full pt-2 pb-6 px-2 flex flex-col justify-between">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <img src="/IBP/logo.svg" alt="YourBank Logo" className="w-10 h-10 mr-2" />
        <span className="font-bold text-3xl">J97Bank</span>
      </div>

      {/* Navigation Links */}
      <nav 
        className="flex flex-col bg-black rounded-3xl p-4 h-full"
        style={{boxShadow: "0px 4px 0px white"}}
        >
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/Home_dark.svg" // Active state image
                        : "/svgForWNC/Home_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-7 me-3"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Dashboard</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="transfer-money"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/Money_dark.svg" // Active state image
                        : "/svgForWNC/Money_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-7 me-3"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Transfer Money</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="manage-beneficiaries"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/User_dark.svg" // Active state image
                        : "/svgForWNC/User_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-7 me-3"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Manage Beneficiaries</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="debt-reminders"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/Credit_dark.svg" // Active state image
                        : "/svgForWNC/Credit_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-7 me-3"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Debt Reminders</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="transaction-history"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/Status_dark.svg" // Active state image
                        : "/svgForWNC/Status_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-7 me-3"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Transaction History</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="settings"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/Setting_dark.svg" // Active state image
                        : "/svgForWNC/Setting_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-7 me-3"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Settings</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="help-center"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-white text-black" : "hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/svgForWNC/Help_dark.svg" // Active state image
                        : "/svgForWNC/Help_light.svg"  // Inactive state image
                    }
                    alt="logo"
                    className="w-7 h-8 me-3 object-contain"
                  />
                  <span className={isActive ? "text-black font-bold" : "text-white font-bold"}>Help Center</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
        {/* User Info */}
        <div className="mt-auto flex flex-col items-center space-y-2">
        <NavLink
            to="profile"
            className={({ isActive }) =>
              `flex items-center w-full px-4 py-2 rounded-lg ${
                isActive ? "bg-white text-black" : "hover:bg-gray-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src="/UserAvatar.png"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <p className={isActive ? "font-bold text-black" : "font-bold text-white"}>Ali Riaz</p>
                  <p className={isActive ? "text-sm text-black" : "text-sm text-gray-500"}>@username</p>
                </div>
              </>
            )}
          </NavLink>
          <button className="flex items-center justify-start w-full px-4 py-2 bg-gray-800 hover:bg-white mt-2 group rounded-full" onClick={handleLogOut}>
            <img
              src="/svgForWNC/Logout_light.svg"
              alt="logo"
              className="w-7 h-8 me-3 object-contain group-hover:hidden"
            />
            <img
              src="/svgForWNC/Logout_dark.svg"
              alt="logo-hover"
              className="w-7 h-8 me-3 object-contain hidden group-hover:block"
            />
            <span className="ml-2 text-white group-hover:text-black">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
