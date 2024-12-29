"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { AuthRoutes, AuthToken, setPath, submitInfo } from "@/libs/slices/sliceAuth";
import { Link, redirect } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";

const FormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters long.",
    }),
});
export type JWTPAYLOAD = {
    sub: string;
    email: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
    jti: string;
    scope: string;
    token_type: string;
}

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();
    const recaptcha = useRef<ReCAPTCHA>(null);
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
        const captchaValue = recaptcha.current?.getValue();
        if (!captchaValue) {
            toast.warning("Please complete the captcha.");
        } else {
            toast.success("Captcha completed");
            dispatch(submitInfo(data));
        }
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
                                            className="mb-5 w-full px-6 py-6 rounded-full bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300"
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
                    <div className="flex justify-center items-center my-3">
                        <ReCAPTCHA ref={recaptcha} sitekey={import.meta.env.VITE_SITE_KEY} />
                    </div>


                    <div className="flex items-center justify-center mb-4">
                        <Link to='/auth/forgotPassword' className="text-lg text-white underline hover:text-green-300">
                            Forgot Password?
                        </Link>
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
                <button className="cursor-pointer border-0 focus:outline-none">
                    <img
                        src={"/IBP/google_icon.svg"}
                        alt="google"
                        className="w-full h-full hover:scale-110 transition-transform duration-200"
                    />
                </button>
                <button className="cursor-pointer border-0 focus:outline-none">
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
