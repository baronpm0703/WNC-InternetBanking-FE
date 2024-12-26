import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import React, { useEffect, useLayoutEffect } from "react";
import { Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../Assists-Components/loadingSpinner";
import { AuthRoutes, newToken, submitRefreshToken } from "@/libs/slices/sliceAuth";
import { toast } from "react-toastify";

const AuthScreen: React.FC = () => {
    const { path, description, loading, approve } = useAppSelector((state) => state.auth);
    const { error, token } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    useLayoutEffect(() => { if (error) toast.error(error) }, [error])
    useEffect(() => {
        if (token && !approve) {
            console.log("Call check token: ", token);
            dispatch(submitRefreshToken());
        }
    }, [token]);
    useEffect(() => {
        const localToken = localStorage.getItem("token");
        if (localToken) {
            dispatch(newToken(JSON.parse(localToken)))
        }
    }, []);
    return (
        <div className="w-screen h-screen py-10 px-4 sm:px-10 relative">
            <div className="flex flex-row w-full justify-between bg-transparent text-white absolute py-10 ps-16 pe-32">
                <div className="flex flex-row items-center">
                    <img src={"/IBP/logo.svg"} alt="logo" className="w-10 h-10 me-1" />
                    <p className="font-bold text-3xl font-lexend">J97Bank</p>
                </div>
                {/* Button */}
                <div className="flex flex-row-reverse">
                    <button
                        className="bg-transparent text-white px-5 py-3 rounded-full text-lg ms-5 font-lexend"
                        aria-label="Sign Up"
                    >
                        Sign Up
                    </button>
                    <button
                        className="bg-green-400 text-white px-5 py-3 text-lg ms-5 rounded-full font-lexend"
                        aria-label="Sign In"
                    >
                        Sign In
                    </button>
                </div>
            </div>
            {/* Back to login */}
            { path != AuthRoutes.LOGIN && (<div className="flex items-center space-x-2 mb-6 absolute pt-32 px-16">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-300 hover:text-green-400 transition duration-200"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>
                <Link
                    to="/"
                    className="text-gray-300 hover:text-green-400 text-sm font-medium transition duration-200"
                >
                    Back to login
                </Link>
            </div>)}
            
            <div className="flex w-full h-full items-center justify-center bg-[url('/background.png')] bg-cover bg-no-repeat rounded-2xl">
                <div className="bg-transparent p-8 rounded-lg shadow-lg w-full">
                    <p className="text-center font-black text-6xl text-green-400 mb-4">
                        {path}
                    </p>
                    <p className="text-gray-400 text-center mb-8">
                        {description}
                    </p>
                    {loading ? (
                            <LoadingSpinner />
                        ) : approve ? (
                            <Navigate to="/dashboard" />
                        ) : (
                            <div className="max-w-md mx-auto">
                                <Outlet />
                            </div>
                        )
                    }

                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
