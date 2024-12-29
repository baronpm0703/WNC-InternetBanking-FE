import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { faCaretDown, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "lodash";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
interface ICommandProps {
  value: string; label: string
}
const commands: ICommandProps[] = [
  { value: "add", label: "Add a new" },
  { value: "delete", label: "Delete a customer" },
]
const FormSchema = z.object({
  account_number: z.string().min(10, { message: "Account number must be at least 10 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).gt(1000, { message: "Amount must be at least 1000" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }),
  note: z.string().min(3, { message: "Note must be at least 3 characters long." }),
})

const DepositUI = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [accountName, setAccountName] = useState("")

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };
  const filteredCommands = Array.isArray(commands)
    ? commands.filter((command) =>
      command.label.toLowerCase().includes(inputValue.toLowerCase())
    ) : [];
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      account_number: "",
      amount: 0,
      email: "",
      name: "",
      note: "",
    },
  })
  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success("Submit completed");
    console.log("Submit", data);
  }
  return (
    <div className="bg-black px-6 pt-6 pb-2 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4" style={{ boxShadow: "0px 4px 0px white" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mb-4 relative flex-1 justify-between">
          {/* Account Number */}
          <p className=" text-white text-md font-bold mb-2">Deposit money to</p>
          <Command className="flex-1 px-5 py-3 rounded-xl bg-gray-900 mb-4">
            <div className="flex flex-row justify-between items-center">
              {/* Account Name */}
              {accountName && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormMessage className="text-red-500 text-sm" />
                      <FormControl>
                        <div className="flex flex-col">
                          <label className=" text-gray-300 text-sm mb-2">Account Name</label>
                          <input
                            type="text"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!open) setOpen(true);
                              handleValueChange(field.value);
                            }}
                            placeholder="Enter Name"
                            className="bg-transparent text-white font-bold focus:outline-none"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              {/* Account Number */}
              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormMessage className="text-red-500 text-sm" />
                    <FormControl>
                      <div className="flex flex-col">
                        <label className=" text-gray-300 text-sm mb-2">Account Number</label>
                        <input
                          type="text"
                          {...field}
                          placeholder="Enter Account Number"
                          className="bg-transparent text-white font-bold focus:outline-none"
                        />
                      </div>

                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormMessage className="text-red-500 text-sm" />
                    <FormControl>
                      <div className="flex flex-col">
                        <label className=" text-gray-300 text-sm mb-2">Email</label>
                        <input
                          type="text"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!open) setOpen(true);
                            handleValueChange(field.value);
                          }}
                          placeholder="Enter Email"
                          className="bg-transparent text-white font-bold focus:outline-none"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />


              <Button
                variant="ghost"
                type="button"
                className="h-8 w-8 p-0 hover:bg-transparent hover:outline-none focus:outline-none"
                onClick={() => {
                  setOpen(prev => !prev);
                }}
              >
                <FontAwesomeIcon icon={faCaretDown} className="text-white" />
              </Button>
            </div>
            <CommandList className={`absolute ${open ? "border" : ""} rounded-lg top-28 left-1/2 w-1/2 z-20 bg-gray-900 text-white`}>
              {open &&
                filteredCommands.length > 0 &&
                filteredCommands.map((command) => (
                  <CommandItem
                    onClick={e => e.stopPropagation()}
                    onSelect={() => {
                      form.setValue("email", command.label);
                      form.setValue("account_number", command.value);
                      form.setValue("name", command.label);
                      setAccountName(command.label);
                    }}
                    key={command.value} value={command.value} className="bg-gray-900 px-5 hover:opacity-50 flex flex-row justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Account Name</span>
                      {command.label}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Account Number</span>
                      {command.label}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Email</span>
                      {command.label}
                    </div>
                  </CommandItem>
                ))
              }
            </CommandList>
          </Command>
          <p className=" text-white text-md font-bold mb-2">Amount & Note</p>
          <div className="w-5/6 px-5 py-3 rounded-xl bg-gray-900 mb-10 flex flex-row justify-between items-center">
            {/* Account Number */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormMessage className="text-red-500 text-sm" />
                  <FormControl>
                    <div className="flex flex-col">
                      <label className=" text-gray-300 text-xs mb-1">Amount</label>
                      <div>
                        <input
                          type="text"
                          {...field}
                          placeholder="Enter Amount"
                          className="bg-transparent text-white text-3xl font-bold focus:outline-none"
                        />
                        <span className="ml-2 text-sm text-gray-500">VND</span>
                      </div>
                      <hr className="mt-1 border-gray-700" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Note Input */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormMessage className="text-red-500 text-sm" />
                  <FormControl>
                    <div className="flex flex-col">
                      <label className=" text-gray-300 text-xs mb-3">Note</label>
                      <div>
                        <input
                          type="text"
                          {...field}
                          placeholder="Enter Amount"
                          className="bg-transparent text-white text-xl font-bold focus:outline-none"
                        />
                      </div>
                      <hr className="mt-1 border-gray-700" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full text-lg bg-green-400 hover:bg-green-500 text-gray-900 font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline">Deposit Money</Button>
        </form>
      </Form>
    </div>
  );
}

export default DepositUI;