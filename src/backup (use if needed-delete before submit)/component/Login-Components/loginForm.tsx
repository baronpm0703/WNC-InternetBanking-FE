"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAppDispatch } from "@/libs/hooks";
import { AuthRoutes, setPath } from "@/libs/slices/sliceAuth";

const FormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 3 characters long.",
    }),
});

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(setPath(AuthRoutes.LOGIN));
    }, []);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mb-4">
                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage className="text-red-500 text-sm px-6" />
                                <FormControl>
                                    <Input
                                        placeholder="Enter your email"
                                        type="email"
                                        {...field}
                                        className="mb-4 w-full px-6 py-6 bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300 rounded-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Password Field */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage className="px-6 pt-3 text-red-500 text-sm" />
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter your password"
                                            type={showPassword ? "text" : "password"}
                                            {...field}
                                            className="mb-4 w-full px-6 py-6 rounded-full bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute border-0 right-0 top-0 h-full pe-5 py-2 bg-transparent hover:bg-transparent cursor-pointer focus:outline-none"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="h-5 w-5" color="#626262" aria-hidden="true" />
                                            ) : (
                                                <EyeOffIcon className="h-5 w-5" color="#626262" aria-hidden="true" />
                                            )}
                                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Captcha */}
                    <div className="flex items-center border border-[#626262] py-1 px-4 mb-4 rounded-full">
                        {/* Checkbox */}
                        <div className="flex items-center">
                            <label className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer w-6 h-6 mr-4 ml-2 bg-gray-200 border-2 border-gray-400 rounded-full appearance-none checked:bg-green-300 checked:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-300 transition duration-100 cursor-pointer"
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute left-3 top-1 w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition duration-300 cursor-pointer"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </label>
                        </div>

                        <span className="text-lg text-white">I'm not a robot</span>
                        <img
                            src="/IBP/captcha.svg"
                            alt="captcha"
                            className="w-16 h-14 ml-auto mr-3 object-contain"
                        />
                    </div>

                    <div className="flex items-center justify-center mb-4">
                        <a href="#" className="text-lg text-white underline hover:text-green-300">
                            Forgot Password?
                        </a>
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-lg bg-green-400 hover:bg-green-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Login
                    </Button>
                </form>
            </Form>
            <div className="flex items-center w-full max-w-md my-6">
                <hr className="flex-grow border-gray-600" />
                <span className="text-gray-400 px-4 text-sm">Or Continue with</span>
                <hr className="flex-grow border-gray-600" />
            </div>
            <div className="flex justify-center space-x-4">
                <button className="cursor-pointer border-0">
                    <img
                        src={"/IBP/google_icon.svg"}
                        alt="google"
                        className="w-full h-full hover:scale-110 transition-transform duration-200"
                    />
                </button>
                <button className="cursor-pointer border-0">
                    <img
                        src={"/IBP/fb_icon.svg"}
                        alt="twitter"
                        className="w-full h-full hover:scale-110 transition-transform duration-200"
                    />
                </button>
            </div>
            <div className="text-center mt-6">
                <a href="#" className="text-white hover:text-green-300 text-sm hover:underline">
                    Sign Up
                </a>
            </div>
        </>
    );
}
