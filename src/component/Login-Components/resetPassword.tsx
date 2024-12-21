"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/libs/hooks"
import { AuthRoutes, changePassword, setPath } from "@/libs/slices/sliceAuth"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export const passwordSchema = z
    .string({
        required_error: "Password can not be empty.",
    })
    .regex(/^.{6,20}$/, {
        message: "Minimum 6 and maximum 20 characters.",
    })
    .regex(/(?=.*[A-Z])/, {
        message: "At least one uppercase character.",
    })
    .regex(/(?=.*[a-z])/, {
        message: "At least one lowercase character.",
    })
    .regex(/(?=.*\d)/, {
        message: "At least one digit.",
    })
    .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
        message: "At least one special character.",
    });

export const FormSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    })

export function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { resetPWDToken, resetPWDEmail } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPath(AuthRoutes.RESET_PASSWORD));
    }, []);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log("Reset Password: ", data);
        if (resetPWDEmail != null && resetPWDToken != null) {
            dispatch(changePassword({ token: resetPWDToken, email: resetPWDEmail, password: data.password }));
        } else {
            toast.warning("Please enter your email address first.");
            navigate('/auth/forgotPassword');
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mb-4">
                    {/* New Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage className="text-red-500 text-sm px-6" />
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter your new password"
                                            type={showPassword ? 'text' : 'password'}
                                            {...field}
                                            className="mb-4 w-full px-6 py-6 bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300 rounded-full" />
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
                                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                                        </Button>
                                    </div>

                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Confirm New Password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage className="text-red-500 text-sm px-6" />
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter your confirm password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...field}
                                            className="mb-4 w-full px-6 py-6 bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300 rounded-full" />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute border-0 right-0 top-0 h-full pe-5 py-2 bg-transparent hover:bg-transparent cursor-pointer focus:outline-none"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeIcon className="h-5 w-5" color="#626262" aria-hidden="true" />
                                            ) : (
                                                <EyeOffIcon className="h-5 w-5" color="#626262" aria-hidden="true" />
                                            )}
                                            <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                                        </Button>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full text-lg bg-green-400 hover:bg-green-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Reset</Button>
                </form>
            </Form>
            <div className="flex items-center w-full max-w-md my-6">
                <hr className="flex-grow border-gray-600" />
                <span className="text-gray-400 px-4 text-sm">Or Continue with</span>
                <hr className="flex-grow border-gray-600" />
            </div>
            <div className="flex justify-center space-x-4">
                <button className="cursor-pointer border-0">
                    <img src={'/IBP/google_icon.svg'} alt="google"
                        className="w-full h-full hover:scale-110 transition-transform duration-200" />
                </button>
                <button className="cursor-pointer border-0">
                    <img src={'/IBP/fb_icon.svg'} alt="twitter"
                        className="w-full h-full hover:scale-110 transition-transform duration-200" />
                </button>
            </div>
        </>
    )
}
