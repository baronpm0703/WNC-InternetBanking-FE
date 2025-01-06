import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { memo, useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAppDispatch } from "@/libs/hooks";
import { interactDialog } from "@/libs/slices/sliceTask";
import { AccountInfo, CreateAccountType, employeeCreateAccount } from "@/libs/slices/sliceAccount";
const createFormSchema = (isEditMode: boolean) =>
  z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    name: z.string().min(5, { message: "Fullname must be at least 5 characters long." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters long." }),
    password: isEditMode
      ? z.string().optional() // Optional in edit mode
      : z.string().min(3, { message: "Password must be at least 3 characters long." }), // Required in create mode
  });
const AccountForm: React.FC<{
  selectedInfo?: AccountInfo | null
  role?: string,
  action?: Function,
  dialogInteraction?: Function
}> = ({selectedInfo, role, action, dialogInteraction}) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const FormSchema = createFormSchema(!!selectedInfo);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      password: "",
    },
  });
  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(form.formState.errors);
    toast.success("Submit completed");
    if (!dialogInteraction) dispatch(interactDialog(false)); 
    else dispatch(dialogInteraction(false));
    console.log("Account: ", data);
    let payload: CreateAccountType = {
      ...data,
      role: role ? role : "Customer",
      username: selectedInfo ? selectedInfo.username :data.email,
    }
    // console.log("Payload: ", payload);
    if (!selectedInfo) dispatch(employeeCreateAccount(payload)); 
    else if (action) dispatch(action(payload));
  }
  useEffect(() => {
    if (selectedInfo) {
      form.setValue("email", selectedInfo.email);
      form.setValue("name", selectedInfo.name);
      form.setValue("phone", selectedInfo.phone);
    }
  }, [])
  return (
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
        {/* Fullname Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormMessage className="text-red-500 text-sm px-6" />
              <FormControl>
                <Input
                  placeholder="Enter your fullname"
                  type="text"
                  {...field}
                  className="mb-4 w-full px-6 py-6 bg-[#1A1A1A] text-[#626262] outline-none focus:outline-none rounded-full"
                />
              </FormControl>
            </FormItem>
          )} />
        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormMessage className="text-red-500 text-sm px-6" />
              <FormControl>
                <Input
                  placeholder="Enter your phone number"
                  type="text"
                  {...field}
                  className="mb-4 w-full px-6 py-6 bg-[#1A1A1A] text-[#626262] border border-[#626262] focus:outline-none focus:border-green-300 rounded-full"
                />
              </FormControl>
            </FormItem>
          )} />
        {/* Password Field */}
        {!selectedInfo && (<FormField
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
        />)}
        {/* Submit Button */}
        <Button type="submit" className="float-right">{selectedInfo ? `Save change`: `Create Account`}</Button>
      </form>
    </Form>
  );
}

export default memo(AccountForm);