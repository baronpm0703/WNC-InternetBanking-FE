"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAppDispatch } from "@/libs/hooks"
import { useEffect } from "react"
import { AuthRoutes, setPath } from "@/libs/slices/sliceAuth"

export const OTPSchema = z
    .string()
    .min(4, { message: "OTP must be at least 4 characters long." })
    .max(6, { message: "OTP must be at most 6 characters long." })
    .regex(/^\d+$/, { message: "OTP must contain only numbers." })


const FormSchema = z.object({
    OTP: OTPSchema,
})

export function VerifyCode() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(setPath(AuthRoutes.VERIFY_CODE));
    }, []);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            OTP: ""
        },
    })
    

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mb-4">
                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="OTP"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage className="text-red-500 text-sm px-6" />
                                <FormControl>
                                    <Input
                                        placeholder="Enter your OTP"
                                        type='text'
                                        {...field}
                                        className="mb-4 w-full px-6 py-6 bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300 rounded-full" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center justify-center mb-4">
                        <a
                            href="#"
                            className="text-lg text-white hover:text-green-300 group hover:underline"
                        >
                            Didn’t receive a code?{" "}
                            <span className="text-green-300 group-hover:text-white">
                                Resend
                            </span>
                        </a>
                    </div>
                    <Button type="submit" className="w-full text-lg bg-green-400 hover:bg-green-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Login</Button>
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
