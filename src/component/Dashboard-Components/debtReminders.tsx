import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../Resusable/dataTable";
import { debteeColumns } from "../Resusable/columns";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { closeCancelDebtModal, closeRepayModal } from "@/libs/slices/sliceTask";
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
import converTypeHelper from "@/helpers/convertTypeHelper";
import { fetchUnpaidInDebt, fetchAllDebt, fetchCreatedDebt, selectDebt, cancelDebt, repayDebt, RepayDebtInfo } from "@/libs/slices/sliceDebt";
import ReactCodeInput from "react-code-input";
import { useParams, useSearchParams } from "react-router-dom";
import { sendOtpTransactionSameBank } from "@/libs/slices/sliceTransaction";

const TransferSchema = z.object({
  account_number: z.string().nonempty({ message: "Please select a beneficiary account." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount." }),
  detail: z.string().nonempty({ message: "Details is required." }),
});

const OTPSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d{6}$/, { message: "Invalid OTP format" }),
});

const CancelDebtSchema = z.object({
  detail: z.string().nonempty({ message: "Please enter the reason Cancel Repay Debt." }),
});

const DebtReminderUI = () => {
  const [searchParams] = useSearchParams();

  // Extract the debt_id query parameter
  const debtId = useMemo(() => searchParams.get("debt_id"), [searchParams]);
  console.log("Debt ID:", debtId);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const { error, accountInfo } = useAppSelector(state => state.account);
  const recipients = accountInfo.recipient_list?.[0]?.recipient_list || [];
  const { isRepayModalOpen } = useAppSelector((state) => state.task);
  const [currentStep, setCurrentStep] = useState<"amount" | "otp">("amount"); // Trạng thái điều khiển bước form
  const { selectedDebt, isRepaySuccess } = useAppSelector(state => state.debt);
  const debts = useAppSelector((state) => state.debt.inDebt);
  const createdDebts = useAppSelector((state) => state.debt.createdDebt);
  const unpaidDebts = useAppSelector((state) => state.debt.unpaidDebt);
  const { isCancelDebtModalOpen } = useAppSelector((state) => state.task);

  useEffect(() => {
    if (accountInfo.account_number) {
      dispatch(fetchAllDebt());
    }
  }, [accountInfo.account_number, dispatch]);

  useEffect(() => {
    if (accountInfo.account_number) {
      dispatch(fetchCreatedDebt(accountInfo.account_number));
    }
  }, [accountInfo.account_number, dispatch]);

  useEffect(() => {
    if (accountInfo.account_number) {
      dispatch(fetchUnpaidInDebt(accountInfo.account_number));
    }
  }, [accountInfo.account_number, dispatch]);

  useEffect(() => {
    if (debts.length > 0) {
      console.log("Fetched debts:", debts);
    }
  }, [debts]);

  useEffect(() => {
    if (debts.length > 0) {
      console.log("Unpaid debts:", debts);
    }
  }, [unpaidDebts]);

  // Form 1: Amount
  const repayForm = useForm({
    defaultValues: {
      amount: selectedDebt ? String(selectedDebt.amount) : "",
    },
  });

  // Form 2: OTP
  const otpForm = useForm({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      otp: "",
    },
  });

  const cancelDebtForm = useForm({
    resolver: zodResolver(CancelDebtSchema),
    defaultValues: {
      debt_id: "",
      detail: "",
    },
  });

  const handleCloseModal = () => {
    dispatch(closeRepayModal());
    repayForm.reset();
    otpForm.reset();
    setCurrentStep("amount");
  };

  const onSubmitRepay = (data: { amount: string }) => {
    console.log("Amount data:", { ...data, debtId: selectedDebt?.id });
    setCurrentStep("otp");
    dispatch(sendOtpTransactionSameBank());
    console.log("HEHE", currentStep)
  };

  const onSubmitOTP = (data: { otp: string }) => {
    console.log("OTP data:", { ...data, debtId: selectedDebt?.id, own_account_number: accountInfo.account_number, target: { account_number: selectedDebt?.debtee_number, name: selectedDebt?.debtee_number } });
    let payload: RepayDebtInfo = {
      debt_id: selectedDebt?.id || "", 
      own_account_number: accountInfo.account_number, 
      otp: data.otp,
      target: { account_number: selectedDebt?.debtee_number || "", name: selectedDebt?.debtee_number || ""} 
    }
    dispatch(repayDebt(payload));
    handleCloseModal();
  };

  useEffect(() => {
    if (selectedDebt?.id) {
      cancelDebtForm.setValue("debt_id", selectedDebt.id);
    }
  }, [selectedDebt, cancelDebtForm]);
  
  const onSubmitCancelDebt = (data: { debt_id: string; detail: string }) => {
    data.debt_id = selectedDebt?.id || "unknown-id";
    dispatch(cancelDebt(data))
      .unwrap()
      .then(() => {
        toast.success("Debt cancelled successfully!");
        dispatch(fetchCreatedDebt(accountInfo.account_number));
        dispatch(fetchUnpaidInDebt(accountInfo.account_number));
        dispatch(closeCancelDebtModal());
      })
      .catch((error) => {
        toast.error(error || "Failed to cancel debt");
        console.error("Error cancelling debt:", error);
      });
  };

  useEffect(() => {
    if (selectedDebt) {
      repayForm.setValue("amount", String(selectedDebt.amount));
    }
  }, [selectedDebt, repayForm]);

  useEffect(() => {
    if (isRepaySuccess) {
      repayForm.reset();
      toast.success("Debt repaid successfully!");
    } else if (error) {
      toast.error(error);
    }
  }, [isRepaySuccess])

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
        dispatch(fetchCreatedDebt(accountInfo.account_number));
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
                                  .filter((account) =>account.bank_id === "6750a0c9a9dc441ad3fbfb9f" &&
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
        <div className="mt-8 p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Debt Send By Other</h3>
          </div>
          <div className="container mx-auto py-4">
            <DataTable columns={debteeColumns} data={converTypeHelper.convertToDebtColumns(unpaidDebts)} />
            <Dialog open={isRepayModalOpen} onOpenChange={handleCloseModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentStep === "amount" ? "Repay Debt" : "Enter OTP"}</DialogTitle>
                </DialogHeader>

                {selectedDebt && currentStep === "amount" && (
                  <Form {...repayForm}>
                    <form
                      onSubmit={repayForm.handleSubmit(onSubmitRepay)}
                      className="space-y-4"
                    >
                      {/* Debtor Information */}
                      <div className="p-6 bg-gradient-to-tr from-[#b9ff66] to-[#9de8ee] rounded-lg shadow-lg text-black">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_name}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee Number</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_number}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg md:col-span-2">
                            <p className="text-sm uppercase tracking-wider font-bold">Amount</p>
                            <p className="text-xl font-bold text-green-600">
                              {currencyHelper.convertToCurrency(selectedDebt.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Modal Footer */}
                      <DialogFooter className="flex justify-end space-x-4 mt-6">
                        <Button
                          type="button"
                          onClick={handleCloseModal}
                          className="py-2 px-6 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="py-2 px-6 rounded-md bg-blue-400 text-white font-semibold hover:from-green-500 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 transition"
                        >
                          Next
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                )}
                {selectedDebt && currentStep === "otp" && (
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onSubmitOTP)} className="space-y-4">
                      <div className="p-6 bg-gradient-to-tr from-[#b9ff66] to-[#9de8ee] rounded-lg shadow-lg text-black">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_name}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee Number</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_number}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg md:col-span-2">
                            <p className="text-sm uppercase tracking-wider font-bold">Amount</p>
                            <p className="text-xl font-bold text-green-600">
                              {currencyHelper.convertToCurrency(selectedDebt.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-600 my-4"></div>

                      <div className="mb-4 flex flex-col items-center bg-black rounded-xl p-4">
                        <p className="text-white text-sm mb-4">Enter OTP sending to your email!</p>
                        <FormField
                          control={otpForm.control}
                          name="otp"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <ReactCodeInput
                                  type="number"
                                  fields={6}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  inputStyle={{
                                    width: "2.5rem",
                                    height: "2.5rem",
                                    margin: "0.5rem",
                                    fontSize: "1.5rem",
                                    textAlign: "center",
                                    borderRadius: "0.5rem",
                                    color: "black",
                                    border: fieldState.error
                                      ? "2px solid red"
                                      : "1px solid green",
                                    backgroundColor: fieldState.error ? "#fee2e2" : "#d1fae5",
                                  }}
                                />
                              </FormControl>
                              {fieldState.error && (
                                <p className="text-red-500 text-sm mt-2">{fieldState.error.message}</p>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Modal Footer */}
                      <DialogFooter>
                        <Button type="button" onClick={handleCloseModal} variant="ghost">
                          Cancel
                        </Button>
                        <Button type="submit">Confirm</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Debt Created By Me</h3>
          </div>
          <div className="container mx-auto py-4">
            <DataTable columns={debteeColumns} data={converTypeHelper.convertToDebtColumns(createdDebts)} />
            <Dialog open={isRepayModalOpen} onOpenChange={handleCloseModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentStep === "amount" ? "Repay Debt" : "Enter OTP"}</DialogTitle>
                </DialogHeader>

                {selectedDebt && currentStep === "amount" && (
                  <Form {...repayForm}>
                    <form
                      onSubmit={repayForm.handleSubmit(onSubmitRepay)}
                      className="space-y-4"
                    >
                      {/* Debtor Information */}
                      <div className="p-6 bg-gradient-to-tr from-[#b9ff66] to-[#9de8ee] rounded-lg shadow-lg text-black">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_name}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee Number</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_number}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg md:col-span-2">
                            <p className="text-sm uppercase tracking-wider font-bold">Amount</p>
                            <p className="text-xl font-bold text-green-600">
                              {currencyHelper.convertToCurrency(selectedDebt.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Modal Footer */}
                      <DialogFooter className="flex justify-end space-x-4 mt-6">
                        <Button
                          type="button"
                          onClick={handleCloseModal}
                          className="py-2 px-6 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="py-2 px-6 rounded-md bg-blue-400 text-white font-semibold hover:from-green-500 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 transition"
                        >
                          Next
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                )}
                {selectedDebt && currentStep === "otp" && (
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onSubmitOTP)} className="space-y-4">
                      {/* OTP Input */}
                      <div className="p-6 bg-gradient-to-tr from-[#b9ff66] to-[#9de8ee] rounded-lg shadow-lg text-black">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee</p>
                            <p className="text-lg font-medium">{selectedDebt.debtee_name}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg">
                            <p className="text-sm uppercase tracking-wider font-bold">Debtee Number</p>
                            <p className="text-lg font-medium">{selectedDebt.debtor_name}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-lg md:col-span-2">
                            <p className="text-sm uppercase tracking-wider font-bold">Amount</p>
                            <p className="text-xl font-bold text-green-600">
                              {currencyHelper.convertToCurrency(selectedDebt.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-600 my-4"></div>

                      <div className="mb-4 flex flex-col items-center bg-black rounded-xl p-4">
                        <p className="text-white text-sm mb-4">Enter OTP sending to your email!</p>
                        <FormField
                          control={otpForm.control}
                          name="otp"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <ReactCodeInput
                                  type="number"
                                  fields={6}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  inputStyle={{
                                    width: "2.5rem",
                                    height: "2.5rem",
                                    margin: "0.5rem",
                                    fontSize: "1.5rem",
                                    textAlign: "center",
                                    borderRadius: "0.5rem",
                                    color: "black",
                                    border: fieldState.error
                                      ? "2px solid red"
                                      : "1px solid green",
                                    backgroundColor: fieldState.error ? "#fee2e2" : "#d1fae5",
                                  }}
                                />
                              </FormControl>
                              {fieldState.error && (
                                <p className="text-red-500 text-sm mt-2">{fieldState.error.message}</p>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Modal Footer */}
                      <DialogFooter>
                        <Button type="button" onClick={handleCloseModal} variant="ghost">
                          Cancel
                        </Button>
                        <Button type="submit">Confirm</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                )}
              </DialogContent>
            </Dialog>
            {selectedDebt && (
              <Dialog open={isCancelDebtModalOpen} onOpenChange={() => { dispatch(closeCancelDebtModal()) }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Debt</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 bg-white rounded-lg shadow-md text-black">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-bold">Debtee</p>
                        <p className="text-md">{selectedDebt.debtee_name} - {selectedDebt.debtee_number}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm font-bold">Debtor</p>
                        <p className="text-md">{selectedDebt.debtor_name} - {selectedDebt.debtor_number}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm font-bold">Amount</p>
                        <p className="text-xl text-green-600 font-bold">
                          {currencyHelper.convertToCurrency(selectedDebt.amount)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm font-bold">Detail</p>
                        <p className="text-md">
                          {selectedDebt.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Form {...cancelDebtForm}>
                    <form onSubmit={cancelDebtForm.handleSubmit(onSubmitCancelDebt)}>
                      <div>
                        <FormField
                          control={cancelDebtForm.control}
                          name="debt_id"
                          render={({ field }) => (
                            <FormItem className="hidden">
                              <label htmlFor="debt_id" className="sr-only">Debt ID</label>
                              <FormControl>
                                <Input
                                  id="debt_id"
                                  {...field}
                                  value={selectedDebt?.id || ""}
                                  readOnly // Không dùng disabled
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormField
                          control={cancelDebtForm.control}
                          name="detail"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <textarea
                                  placeholder="Details"
                                  {...field}
                                  className="w-full py-4 px-4 mb-2 bg-green-100 text-black rounded-xl border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 resize-none"
                                  rows={4} // Số dòng mặc định
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" className="border border-black bg-white text-black" onClick={() => { dispatch(closeCancelDebtModal()) }}>
                          Exit
                        </Button>
                        <Button type="submit" className="bg-red-500">Cancel Debt</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
    </div >
  );
};

export default DebtReminderUI;