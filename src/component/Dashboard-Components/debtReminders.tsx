import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { debtColumns, inDebts } from "../Resusable/columns";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { createDebtRemind, fetchTransactionTarget } from "@/libs/slices/sliceAccount";
import { toast } from "react-toastify";
import currencyHelper from "@/helper/currencyHelper";
import timeStampHelper from "@/helper/convertTimeStamp";

const TransferSchema = z.object({
  account_number: z.string().nonempty({ message: "Please select a beneficiary account." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount." }),
  detail: z.string().nonempty({ message: "Details is required." }),
});


const DebtReminderUI = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { isOpenDialog } = useAppSelector(state => state.task);
  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const { error, accountInfo } = useAppSelector(state => state.account);
  const recipients = accountInfo.recipient_list?.[0]?.recipient_list || [];

  const debtRemindForm = useForm({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      account_number: "",
      amount: "",
      detail: "",
    },
  });

  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChangeSameBank = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debtRemindForm.setValue("account_number", "");
    setSelectedTransferTo({ attribute1: "", attribute2: "" });
    debtRemindForm.clearErrors("account_number");
  };

  const handleFetchTargetDataSameBank = () => {
    if (!inputValue.trim()) {
      return;
    }

    const accountNumber = accountInfo.account_number;

    if (accountNumber && accountNumber === inputValue.trim()) {
      debtRemindForm.setError("account_number", {
        type: "manual",
        message: "You cannot save yourself as your Beneficiary",
      });
      return;
    }

    dispatch(fetchTransactionTarget(inputValue.trim()))
      .unwrap()
      .then((data) => {
        if (accountNumber && accountNumber === data.account_number) {
          debtRemindForm.setError("account_number", {
            type: "manual",
            message: "You cannot save yourself as your Beneficiary",
          });
          return;
        }
        setSelectedTransferTo({
          attribute1: data.name,
          attribute2: data.account_number,
        });
        debtRemindForm.setValue("account_number", data.account_number);
        console.log("account number", debtRemindForm.getValues("account_number"))
      })
      .catch((err) => {
        console.error("Error fetching target data:", err);
        debtRemindForm.setError("account_number", {
          type: "manual",
          message: "No account number found",
        });
      });
  };

  const onSubmitDebtReminder = (data: { account_number: string; amount: string; details: string }) => {
    dispatch(createDebtRemind(data))
      .unwrap()
      .then(() => {
        console.log("data debt remind", data)
        debtRemindForm.reset();
        toast.success("Debt remind created successfully!");
      })
      .catch((err) => {
        console.error("Error creating debt remind:", err);
        toast.error(err || "Failed to create debt remind.");
      });
  };

  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Tabs */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Debt Reminder</h1>
          <p className="text-gray-400">Your Money, Your Control!</p>
        </div>
        <div className="bg-black p-6 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4" style={{ boxShadow: "0px 4px 0px white" }}>
          {
            <Form {...debtRemindForm}>
              <form onSubmit={debtRemindForm.handleSubmit(onSubmitDebtReminder)} className={`space-y-6 transition-all duration-1000 transform ${activeTab === "createReminder"
                ? "opacity-100 translate-y-0 max-h-screen"
                : "opacity-0 translate-y-[20px] max-h-0 overflow-hidden"
                }`}>
                <FormField
                  control={debtRemindForm.control}
                  name="account_number"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <label className="block text-white text-sm mb-2">Remind To</label>
                      <FormControl>
                        <div className="flex justify-between items-center space-x-3">
                          {/* Input Field */}
                          <div className={`relative w-1/2 form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${error ? "border-red-500" : "border-gray-800"
                            } focus:outline-none`}>
                            <input
                              type="text"
                              placeholder="Enter account number"
                              value={inputValue}
                              className={`w-full bg-gray-900 text-white rounded-xl focus:outline-none`}
                              onChange={handleInputChangeSameBank}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleFetchTargetDataSameBank();
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleFetchTargetDataSameBank}
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 12h14M12 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Dropdown Menu */}
                          <div className="w-1/2 relative">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={`w-full form-select bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                    } focus:outline-none hover:border-white transition-all duration-200`}
                                >
                                  {selectedTransferTo.attribute1
                                    ? `${selectedTransferTo.attribute1} - ${selectedTransferTo.attribute2}`
                                    : "Select Beneficiary Account"}
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent className="w-full">
                                <DropdownMenuLabel>Select an Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-2">
                                  <input
                                    type="text"
                                    placeholder="Search accounts..."
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none rounded-xl focus:ring focus:ring-blue-500 text-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                </div>
                                <DropdownMenuSeparator />
                                {recipients
                                  .filter((account) =>
                                    `${account.reminder_name} - ${account.account_number}`
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  )
                                  .map((account) => (
                                    <DropdownMenuItem
                                      key={account.account_number}
                                      onClick={() => {
                                        setSelectedTransferTo({
                                          attribute1: account.reminder_name,
                                          attribute2: account.account_number,
                                        });
                                        debtRemindForm.setValue("account_number", account.account_number);
                                        console.log("account number", debtRemindForm.getValues("account_number"))
                                        setInputValue(account.account_number);
                                      }}
                                      className="flex items-center justify-between px-4 py-2 space-x-4"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <img
                                          src="https://via.placeholder.com/40" // URL avatar thực tế
                                          alt={account.reminder_name}
                                          className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                          <p className="text-sm font-medium text-black">{account.reminder_name}</p>
                                          <p className="text-xs font-bold text-gray-400">{account.account_number}</p>
                                        </div>
                                      </div>
                                      <span className="text-gray-400 text-sx">{'>'}</span>
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </FormControl>

                      {fieldState.error && (
                        <FormMessage className="text-red-500 text-sm">
                          {fieldState.error.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <div className="flex space-x-4">
                  {/* Amount */}
                  <FormField
                    control={debtRemindForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <label className="block text-gray-400 text-sm mb-1">Amount</label>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="100.000"
                            {...field}
                            className="w-full py-6 px-4 bg-gray-900 text-white rounded-xl border border-gray-800 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Purpose */}
                  <FormField
                    control={debtRemindForm.control}
                    name="detail"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <label className="block text-gray-400 text-sm mb-1">Details</label>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Details"
                            {...field}
                            className="w-full py-6 px-4 bg-gray-900 text-white rounded-xl border border-gray-800 focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full"
                >
                  Transfer
                </Button>
              </form>
            </Form>
          }

          <div className={`w-full flex justify-center mt-3 transition-all duration-700 transform ${activeTab != "createReminder"
            ? "opacity-100 translate-y-0 max-h-screen"
            : "opacity-0 translate-y-[20px] max-h-0 overflow-hidden"
            }`}>
            <button className="w-1/2 py-3 bg-[#B9FF66] text-black font-bold rounded-full" onClick={() => { setActiveTab("createReminder") }}>
              Create Reminder
            </button>
          </div>

        </div>
        {/* Debt table */}
        <div className="container mx-auto py-10">
          <Dialog open={isOpenDialog} onOpenChange={(data) => {
            console.log(data);
            dispatch(interactDialog(data));
          }}>
            <DataTable columns={debtColumns} data={inDebts} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Debt Remind</DialogTitle>
                <DialogDescription>Nothing</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Account Overview */}
      <div className="w-1/3 pl-4">
        <div className="rounded-3xl shadow-md mb-8">
          <h3 className="text-xl font-bold mb-4">Account Overview</h3>
          <div className="border border-white/20 bg-black p-6 rounded-3xl shadow-md shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
            <p className="font-bold mb-4">My Card</p>
            <div className="bg-gradient-to-br from-green-400 to-blue-300 rounded-3xl p-8 justify-between relative shadow-md mb-4">
              <div className="text-black font-medium mb-6">{accountInfo.name}</div>

              <div className="text-black text-lg tracking-widest space-y-1 mb-6">
                <p>{accountInfo.account_number}</p>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-black text-sm">{accountInfo.name}</div>
                <div className="text-black text-sm">{timeStampHelper.formatToMonthYear(accountInfo.created_at || "")}</div>
              </div>
              <div className="absolute top-5 right-5 text-black font-bold text-lg">VISA</div>
            </div>
            <p className="font-bold mb-2">Card Balance</p>
            <h2 className="text-2xl font-bold">{currencyHelper.convertToCurrency(accountInfo.account_balance)}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtReminderUI;