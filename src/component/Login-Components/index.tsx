import React from "react";

const Login: React.FC = () => {
    return (
        <div className="w-screen h-screen bg-white py-10 px-10 relative">
            <div className="flex flex-row w-full justify-between bg-transparent text-white absolute py-10 ps-16 pe-32">
                <div className="flex flex-row items-center">
                    <img src={'/IBP/logo.svg'} alt="logo" className="w-10 h-10 me-1" />
                    <p className="font-bold text-3xl font-lexend">
                        J97Bank
                    </p>
                </div>
                {/* Button */}
                <div className="flex flex-row-reverse">
                    <button className="bg-green-400 text-white px-5 py-3 rounded-full text-lg ms-5 font-lexend">
                        Sign Up
                    </button>
                    <button className="bg-transparent text-white px-5 py-3 font-lexend">
                        Sign In
                    </button>
                </div>
            </div>
            <div className="flex w-full h-full items-center justify-center bg-[url('/background.png')] bg-cover bg-no-repeat rounded-2xl">
                <div className="bg-transparent p-8 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <h1 className="text-3xl font-bold text-green-400">YourBanK</h1>
                    </div>
                    <h2 className="text-center text-2xl text-green-300 mb-4">Login</h2>
                    <p className="text-gray-400 text-center mb-8">
                        Welcome back! Please log in to access your account.
                    </p>
                    <form>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-300 mb-2">
                                Enter your Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
                                placeholder="Enter your Email"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-300 mb-2">
                                Enter your Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
                                    placeholder="Enter your Password"
                                    required
                                />
                                <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">
                                    👁️
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="mr-2"
                                />
                                <label htmlFor="remember" className="text-gray-300 text-sm">
                                    I'm not a robot
                                </label>
                            </div>
                            <a href="#" className="text-sm text-green-300 hover:underline">
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-400 hover:bg-green-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Login
                        </button>
                    </form>
                    <div className="my-6 text-gray-400 text-center">Or Continue with</div>
                    <div className="flex justify-center gap-4">
                        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-gray-300">
                            G
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-gray-300">
                            F
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <a
                            href="#"
                            className="text-green-300 text-sm hover:underline"
                        >
                            Sign Up
                        </a>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Login;
