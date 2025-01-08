import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { AccountInfo, depositCustomer, DepositInfo, resetSelected } from "@/libs/slices/sliceAccount";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import LoadingSpinner from "../Assists-Components/loadingSpinner";
import { debounce } from "lodash";

const FormSchema = z.object({
  account_number: z.string().min(3, { message: "Account number must be at least 10 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  amount: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number().positive("Amount must be a positive number").gt(1000, { message: "Amount must be at least 1000" }),
  ),
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }),
  note: z.string().min(3, { message: "Note must be at least 3 characters long." }),
})

const DepositUI = () => {
  const [open, setOpen] = useState(false);
  const { selectedCustomer, depositSuccess, loading, error, customerAccount } = useAppSelector(state => state.account);
  const [accountName, setAccountName] = useState("");
  const suggestListRef = useRef<HTMLDivElement>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountInfo[]>([]);

  const dispatch = useAppDispatch();
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
    let convertData: DepositInfo 
    if (!data.account_number) {
      convertData = {
        amount: data.amount,
        remarks: data.note,
        email: data.email
      }
    } else {
      convertData = {
        accountNumber: data.account_number,
        amount: data.amount,
        remarks: data.note,
      }
    }
    
    dispatch(depositCustomer(convertData));
  }

  // Debounced function to filter customer accounts
  const filterAccounts = useCallback(
    debounce((accountNumber: string) => {
      if (!Array.isArray(customerAccount)) {
        setFilteredAccounts([]);
        return;
      }

      const filtered = customerAccount.filter((account) =>
        account.account_number.toLowerCase().includes(accountNumber.toLowerCase())
      );
      setFilteredAccounts(filtered);
    }, 300),
    [customerAccount]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestListRef.current && !suggestListRef.current.contains(event.target as Node) && !suggestListRef.current.closest(".accountNumber_input")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Use `getValues` for the latest input value
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "account_number") {
        const accountNumber = value.account_number || "";
        filterAccounts(accountNumber);
      }
    });

    return () => subscription.unsubscribe(); // Cleanup subscription
  }, [form, filterAccounts]);

  useEffect(() => {
    // console.log("Error: ", error, loading);
    if (!loading) {
      if (error) {
        toast.error(error);
      }
      if (depositSuccess) {
        form.reset();
        dispatch(resetSelected());
        toast.success("Deposit success");
      }
    }
  }, [loading, error, depositSuccess]);
  // Update form fields when `selectedCustomer` changes
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("name", selectedCustomer.name || "");
      form.setValue("email", selectedCustomer.email || "");
      form.setValue("account_number", selectedCustomer.account_number || "");
      setAccountName(selectedCustomer.name);
    }
  }, [selectedCustomer]);
  return (
    <div className="bg-black px-6 pt-6 pb-2 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4" style={{ boxShadow: "0px 4px 0px white" }}>
      {loading && <LoadingSpinner />}
      {!loading && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mb-4 flex-1 justify-between">
            {/* Account Number */}
            <p className=" text-white text-md font-bold mb-2">Deposit money to</p>
            <Command className="overflow-visible flex-1 px-5 py-3 rounded-xl bg-gray-900 mb-4 relative">
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
                            onClick={() => setOpen(true)}
                            placeholder="Enter Account Number"
                            className="bg-transparent text-white font-bold focus:outline-none accountNumber_input"
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
                            placeholder="Enter Email"
                            className="bg-transparent text-white font-bold focus:outline-none"
                            style={{
                              width: `${Math.max(field.value.length + 1, 10)}ch`, // Dynamically adjust width
                              minWidth: "10ch", // Minimum width to prevent shrinking
                            }}
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
              <CommandList ref={suggestListRef} className={`${open ? "border" : ""} absolute rounded-lg top-[calc(100%)] left-0 w-full z-20 bg-gray-900 text-white`}>
                {open &&
                  filteredAccounts && filteredAccounts.length > 0 &&
                  filteredAccounts.map((account) => (
                    <CommandItem
                      onClick={e => e.stopPropagation()}
                      onSelect={() => {
                        form.setValue("email", account.email);
                        form.setValue("account_number", account.account_number);
                        form.setValue("name", account.name);
                        setAccountName(account.name);
                        setOpen(false);
                      }}
                      key={account.account_number} value={account.account_number} className="bg-gray-900 px-5 hover:opacity-50 space-x-2 flex flex-row justify-between">
                      <div className="flex flex-col w-1/3">
                        <span className="text-xs text-gray-400">Account Name</span>
                        {account.name}
                      </div>
                      <div className="flex flex-col w-1/3">
                        <span className="text-xs text-gray-400">Account Number</span>
                        {account.account_number}
                      </div>
                      <div className="flex flex-col w-1/3">
                        <span className="text-xs text-gray-400">Email</span>
                        {account.email}
                      </div>
                    </CommandItem>))
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
      )}

    </div>
  );
}

export default DepositUI;