import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { beneficiaryColumns, inBeneficiaries } from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog } from "@/libs/slices/sliceTask";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EyeIcon } from "lucide-react";


export const profileSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z
        .string()
        .regex(/^0\d{9}$/, "Invalid phone number"),
});

export const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Path for error message
});


const ProfileUI = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        name: "Alexa Rawles",
        email: "alexarawles@gmail.com",
        phone: "0123456789",
    });

    const handleEditClick = () => {
        editProfileForm.reset(profileData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const editProfileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handlePasswordEditClick = () => {
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
    };

    const onPasswordSubmit = (data) => {
        console.log("Password Update Data:", data);
        // Add logic for updating password here
        setIsPasswordModalOpen(false);
    };

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        setIsModalOpen(false);
    };

    return (
        <div className="text-white font-sans flex">
            <div className="flex-1 rounded-3xl">
                {/* Tabs */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Your Profile Information </h1>
                    <p className="text-gray-400">To view your profile information!</p>
                </div>
                {/* Card information */}
                <div className="flex-1 rounded-3xl bg-black p-8 shadow-md border border-gray-700">
                    <div className="flex items-center mb-6">
                        {/* Avatar */}
                        <img
                            src="https://via.placeholder.com/80"
                            alt="User Avatar"
                            className="w-20 h-20 rounded-full mr-4"
                        />
                        {/* User Info */}
                        <div>
                            <h2 className="text-xl font-bold text-white">Alexa Rawles</h2>
                            <p className="text-gray-400">alexarawles@gmail.com</p>
                        </div>
                        {/* Edit Button */}
                        <button
                            onClick={handleEditClick}
                            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Edit
                        </button>
                    </div>

                    {/* Additional User Info */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <p className="text-gray-400">Full Name</p>
                            <p className="text-white font-medium">Alexa Rawles</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-400">Email</p>
                            <p className="text-white font-medium">alexarawles@gmail.com</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-400">Phone</p>
                            <p className="text-white font-medium">+123 456 789</p>
                        </div>
                    </div>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-8 w-1/3">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-black">Edit Profile</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex items-center justify-center mb-6">
                                <div className="relative">
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full border border-gray-300 object-cover"
                                    />
                                    <label
                                        htmlFor="profileImage"
                                        className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M15.232 5.232l3.536 3.536-10.607 10.607H4.625v-3.536l10.607-10.607zM17.75 2a1.5 1.5 0 011.06.44l2.75 2.75a1.5 1.5 0 010 2.121l-2.121 2.121-3.536-3.536L17.31 2.44A1.5 1.5 0 0117.75 2z" />
                                            <path d="M0 20.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H1.5v2.25a.75.75 0 01-1.5 0v-3z" />
                                        </svg>
                                    </label>
                                    <input
                                        id="profileImage"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <Form {...editProfileForm}>
                                <form
                                    onSubmit={editProfileForm.handleSubmit(onSubmit)}
                                    className="space-y-6 transition-all duration-1000 transform"
                                >
                                    {/* Full Name Field */}
                                    <FormField
                                        control={editProfileForm.control}
                                        name="name"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <label className="block text-gray-700 text-sm mb-2">Full Name</label>
                                                <FormControl>
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        {...field}
                                                        className={`w-full py-3 px-4 bg-gray-900 text-white rounded-xl border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                            } focus:outline-none`}
                                                    />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage className="text-red-500 text-sm">
                                                        {fieldState.error.message}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email Field */}
                                    <FormField
                                        control={editProfileForm.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <label className="block text-gray-700 text-sm mb-2">Email</label>
                                                <FormControl>
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        {...field}
                                                        className={`w-full py-3 px-4 bg-gray-900 text-white rounded-xl border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                            } focus:outline-none`}
                                                    />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage className="text-red-500 text-sm">
                                                        {fieldState.error.message}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Phone Field */}
                                    <FormField
                                        control={editProfileForm.control}
                                        name="phone"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <label className="block text-gray-700 text-sm mb-2">Phone</label>
                                                <FormControl>
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone"
                                                        {...field}
                                                        className={`w-full py-3 px-4 bg-gray-900 text-white rounded-xl border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                            } focus:outline-none`}
                                                    />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage className="text-red-500 text-sm">
                                                        {fieldState.error.message}
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <div className="mt-6 flex justify-end">
                                        <Button
                                            onClick={handleCloseModal}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                )}

                {/* Change Password */}
                <div className="flex-1 mt-6 rounded-3xl bg-black p-8 shadow-md border border-gray-700">
                    <div className="flex justify-between items-center">
                        <p className="text-white font-semibold">Change Password</p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" onClick={handlePasswordEditClick}>
                            Change
                        </button>
                    </div>
                </div>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-8 w-1/3">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-black">Edit Password</h2>
                                <button
                                    onClick={handleClosePasswordModal}
                                    className="text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>
                            </div>

                            <Form {...passwordForm}>
                                <form
                                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                                    className="space-y-6"
                                >
                                    {/* Current Password Field */}
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
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

                                    {/* New Password Field */}
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormMessage className="px-6 pt-3 text-red-500 text-sm" />
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Enter your New password"
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

                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormMessage className="px-6 pt-3 text-red-500 text-sm" />
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Enter your Confirm password"
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

                                    {/* Confirm Password Field */}


                                    <div className="mt-6 flex justify-end">
                                        <Button
                                            onClick={handleClosePasswordModal}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                )}
            </div >

            {/* Account Overview */}
            <div className="w-1/3 pl-4">
                <div className="rounded-3xl shadow-md mb-8">
                    <h3 className="text-xl font-bold mb-4">Account Overview</h3>
                    <div className="border border-white/20 bg-black p-6 rounded-3xl shadow-md shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
                        <p className="font-bold mb-4">My Card</p>
                        <div className="bg-gradient-to-br from-green-400 to-blue-300 rounded-3xl p-8 justify-between relative shadow-md mb-4">
                            <div className="text-black font-medium mb-6">Lora Lewis</div>

                            <div className="text-black text-lg tracking-widest space-y-1 mb-6">
                                <p>1234 5678 0102 2937</p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="text-black text-sm">Lora Lewis</div>
                                <div className="text-black text-sm">02/2024</div>
                            </div>

                            <div className="absolute top-5 right-5 text-black font-bold text-lg">VISA</div>
                        </div>
                        <p className="font-bold mb-2">Card Balance</p>
                        <h2 className="text-2xl font-bold">$15,595.015</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUI;