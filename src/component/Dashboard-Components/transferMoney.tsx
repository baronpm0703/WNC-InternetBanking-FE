import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import currencyHelper from "@/helper/currencyHelper";

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
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { fetchAccountInfo, fetchTransactionTarget } from "@/libs/slices/sliceAccount";
import timeStampHelper from "@/helper/convertTimeStamp";
import { createInternalTransaction, sendOtpTransactionSameBank } from "@/libs/slices/sliceTransaction";

const TransferSchema = z.object({
  transferFrom: z.string().nonempty({ message: "Please select a source account." }),
  transferTo: z.string().nonempty({ message: "Please select a beneficiary account." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount." }),
  purpose: z.string().nonempty({ message: "Purpose is required." }),
  feePayer: z.string().nonempty({ message: "Please select a fee payer." }),
});

const OtpFormSchemaSameBank = z.object({
  own_account_number: z.string().nonempty({ message: "Source account is required." }),
  otp: z
    .string()
    .nonempty({ message: "OTP is required." })
    .regex(/^\d{6}$/, { message: "OTP must be a 6-digit number." }),
  target: z.object({
    account_number: z.string().nonempty({ message: "Beneficiary account number is required." }),
    name: z.string().nonempty({ message: "Beneficiary name is required." }),
  }),
  payment_method: z.string().nonempty({ message: "Payment method is required." }),
  amount: z
    .number()
    .min(0.01, { message: "Amount must be greater than 0." }),
  remarks: z.string().optional(),
});

const TransferInterBankSchema = z.object({
  transferFrom: z.string().nonempty({ message: "Please select a source account." }),
  toBank: z.string().nonempty({ message: "Please select a bank account." }),
  transferTo: z.string().nonempty({ message: "Please select a beneficiary account." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount." }),
  purpose: z.string().nonempty({ message: "Purpose is required." }),
  feePayer: z.string().nonempty({ message: "Please select a fee payer." }),
});

const TransferUI = () => {

  const [activeTab, setActiveTab] = useState("sameBank");
  const [activeStep, setActiveStep] = useState("transfer"); // New state for tracking steps
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error, accountInfo } = useAppSelector(state => state.account);

  useEffect(() => {
    console.log("Fetching Account Info");
    dispatch(fetchAccountInfo());
  }, []);


  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
  const [selectedTransferToInterBank, setSelectedTransferToInterBank] = useState({ attribute1: '', attribute2: '', attribute3: '' });

  const setActiveTabAndCloseDropdowns = (tab: string) => {
    setActiveTab(tab);
  };

  const [formData, setFormData] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      transferFrom: "",
      transferTo: "",
      amount: "",
      purpose: "",
      feePayer: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (accountInfo.name && accountInfo.account_number) {
      reset({
        transferFrom: `${accountInfo.name} - ${accountInfo.account_number}`,
        transferTo: "",
        amount: "",
        purpose: "",
        feePayer: "",
      });
    }
  }, [accountInfo, reset]);

  useEffect(() => {
    const date = timeStampHelper.formatTimestamp(accountInfo.created_at || "");
  }, [name])

  const formInterBank = useForm({
    resolver: zodResolver(TransferInterBankSchema),
    defaultValues: {
      transferFrom: `${accountInfo.name} - ${accountInfo.account_number}`,
      toBank: "",
      transferTo: "",
      amount: "",
      purpose: "",
      feePayer: "",
    },
  });


  const formOtpSameBank = useForm({
    resolver: zodResolver(OtpFormSchemaSameBank),
    defaultValues: {
      own_account_number: "",
      otp: "",
      target: {
        account_number: "",
        name: "",
      },
      payment_method: "Sender Pay",
      amount: 0,
      remarks: "",
    },
  });

  function onSubmitSameBank(data: any) {
    const [transferFromName, ownAccountNumber] = data.transferFrom.split(" - ");
    const [targetName, targetAccountNumber] = data.transferTo.split(" - ");

    // Cập nhật giá trị cho formOtpSameBank
    formOtpSameBank.setValue("own_account_number", ownAccountNumber);
    formOtpSameBank.setValue("otp", ""); // OTP sẽ được nhập trong bước sau
    formOtpSameBank.setValue("target.account_number", targetAccountNumber);
    formOtpSameBank.setValue("target.name", targetName);
    formOtpSameBank.setValue("payment_method", data.feePayer);
    formOtpSameBank.setValue("amount", parseFloat(data.amount)); // Đảm bảo là số
    formOtpSameBank.setValue("remarks", data.purpose);

    // Debug để kiểm tra dữ liệu được cập nhật
    console.log("Updated formOtpSameBank:", formOtpSameBank.getValues());

    setActiveStep("otp");

    dispatch(sendOtpTransactionSameBank(data))
      .unwrap()
      .then((response: any) => {
        console.log("Transaction created successfully:", response);
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
      });
  }

  function onSubmitSameBankOTP(data: any) {
    dispatch(createInternalTransaction(data))
      .unwrap()
      .then((response: any) => {
        console.log("Transaction created successfully:", response);
        setActiveStep("transferSuccess");
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
      });
  }

  function onSubmitInterBank(data: any) {
    console.log("Form Submitted:", data);
    setFormData(data);
    setActiveStep("otp");
  }

  function onSubmitInterBankOTP(data: any) {
    console.log("Form Submitted otp inter bank:", data);
  }

  // const handleTransferToInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const inputValue = event.target.value.trim();

  //   if (inputValue === "") {
  //     setSelectedTransferTo({ attribute1: "", attribute2: "" });
  //     form.setValue("transferTo", "");
  //     return;
  //   }

  //   const matchedItem = accounts.find(
  //     (item) => item.attribute2 === inputValue
  //   );

  //   if (matchedItem) {
  //     setSelectedTransferTo(matchedItem);
  //     form.setValue(
  //       "transferTo",
  //       `${matchedItem.attribute1} - ${matchedItem.attribute2}`
  //     );
  //   } else {
  //     setSelectedTransferTo({ attribute1: "", attribute2: inputValue });
  //     form.setError("transferTo", {
  //       type: "manual",
  //       message: "Account number is not valid.",
  //     });
  //   }
  // };

  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChangeSameBank = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    form.setValue("transferTo", "");
    setSelectedTransferTo({ attribute1: "", attribute2: "" });
    form.clearErrors("transferTo");
  };


  const handleFetchTargetDataSameBank = () => {
    if (!inputValue.trim()) {
      return;
    }
    const transferFrom = form.getValues("transferFrom");

    dispatch(fetchTransactionTarget(inputValue.trim()))
      .unwrap()
      .then((data) => {
        if (transferFrom && transferFrom.includes(data.account_number)) {
          form.setError("transferTo", {
            type: "manual",
            message: "You cannot transfer to yourself",
          });
          return;
        }
        setSelectedTransferTo({
          attribute1: data.name,
          attribute2: data.account_number,
        });
        form.setValue("transferTo", `${data.name} - ${data.account_number}`);
        console.log("Data: ", form.getValues("transferTo"));
      })
      .catch((err) => {
        console.error("Error fetching target data:", err);
        form.setError("transferTo", {
          type: "manual",
          message: "No account number found",
        });
      });
  };

  const handleTransferToInputChangeInterBank = (event) => {
    const inputAccountNumber = event.target.value.trim();
    setAccountNumberInput(inputAccountNumber);

    const toBankValue = formInterBank.watch('toBank');

    if (inputAccountNumber === "") {
      setSelectedTransferToInterBank({ attribute1: "", attribute2: "", attribute3: "" });
      formInterBank.setValue("transferTo", "");
      return;
    }

    const matchedAccount = interBankAccounts.find(
      (account) =>
        account.attribute2 === inputAccountNumber && account.attribute3 === toBankValue
    );

    if (matchedAccount) {
      setSelectedTransferToInterBank(matchedAccount);
      formInterBank.setValue(
        "transferTo",
        `${matchedAccount.attribute1} - ${matchedAccount.attribute2}`
      );
      formInterBank.clearErrors("transferTo"); // Xóa lỗi nếu có
    } else {
      setSelectedTransferToInterBank({ attribute1: "", attribute2: inputAccountNumber, attribute3: "" });
      formInterBank.setError("transferTo", {
        type: "manual",
        message: "Account number is not valid or does not match the selected bank.",
      });
    }
  };

  const [accountNumberInput, setAccountNumberInput] = useState('');

  const [searchQuery, setSearchQuery] = useState("");

  const accounts = [
    { attribute1: "NGUYEN LAM HAI", attribute2: "123456" },
    { attribute1: "PHAN THAI KHANG", attribute2: "22222" },
    { attribute1: "NGUYEN PHU MINH BAO", attribute2: "233434" },
    { attribute1: "NGUYEN ANH KHOA", attribute2: "35667" },
  ];

  const interBankAccounts = [
    { attribute1: "NGUYEN LAM HAI", attribute2: "123456", attribute3: "MT BANK" },
    { attribute1: "PHAN THAI KHANG", attribute2: "22222", attribute3: "KP BANK" },
    { attribute1: "NGUYEN PHU MINH BAO", attribute2: "233434", attribute3: "TP BANK" },
    { attribute1: "NGUYEN ANH KHOA", attribute2: "35667", attribute3: "MB BANK" },
  ];

  const banks = [
    { attribute1: "MT BANK" },
    { attribute1: "TP BANK" },
    { attribute1: "AB BANK" },
    { attribute1: "CD BANK" },
  ];

  accounts.filter((account) =>
    `${account.attribute1} - ${account.attribute2}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  interBankAccounts.filter((interBankAccount) =>
    `${interBankAccount.attribute1} - ${interBankAccount.attribute2} - ${interBankAccount.attribute3}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  banks.filter((bank) =>
    `${bank.attribute1}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const [isSaveBeneficiary, setIsSaveBeneficiary] = useState(false);
  const [memory, setMemory] = useState("");

  const [toBankValue, setToBankValue] = useState('');

  useEffect(() => {
    const subscription = formInterBank.watch((value) => {
      setToBankValue(value.toBank || '');
    });
    return () => subscription.unsubscribe();
  }, [formInterBank]);


  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Tabs */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Transfer Money</h1>
          <p className="text-gray-400">Your Money, Your Control!</p>
        </div>
        <div className="bg-black p-6 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4">
          <div className="flex space-x-4 mb-6 items-center">
            {activeStep === "transfer" ? (
              <>
                {/* Hiển thị nút Same Bank và InterBank */}
                <button
                  onClick={() => setActiveTabAndCloseDropdowns("sameBank")}
                  className={`flex-1 py-3 font-bold rounded-2xl ${activeTab === "sameBank"
                    ? "bg-white text-black"
                    : "bg-black text-white border border-gray-600"
                    }`}
                >
                  Same Bank
                </button>
                <button
                  onClick={() => setActiveTabAndCloseDropdowns("interBank")}
                  className={`flex-1 py-3 font-bold rounded-2xl ${activeTab === "interBank"
                    ? "bg-white text-black"
                    : "bg-black text-white border border-gray-600"
                    }`}
                >
                  InterBank
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveStep("transfer")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-lg border border-gray-300"
              >
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
              </button>
            )}
          </div>

          {/* Form Logic */}
          {activeTab === "sameBank" ? (
            activeStep === "transfer" ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSameBank)} className="w-full space-y-6">
                  {/* Transfer From */}
                  <FormField
                    control={form.control}
                    name="transferFrom"
                    render={({ field }) => (
                      <FormItem>
                        <label className="block text-white text-sm mb-2">Transfer From</label>
                        <FormControl>
                          <input
                            type="text"
                            readOnly
                            className="w-full form-input bg-gray-900 text-white rounded-xl px-4 py-2 border border-gray-800 focus:outline-none cursor-not-allowed"
                            {...field}
                            value={`${accountInfo.name} - ${accountInfo.account_number}`}

                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transferTo"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <label className="block text-white text-sm mb-2">Transfer To</label>
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
                                  {accounts
                                    .filter((account) =>
                                      `${account.attribute1} - ${account.attribute2}`
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                    )
                                    .map((account) => (
                                      <DropdownMenuItem
                                        key={account.attribute2}
                                        onClick={() => {
                                          setSelectedTransferTo(account);
                                          field.onChange(`${account.attribute1} - ${account.attribute2}`);
                                        }}
                                        className="flex items-center justify-between px-4 py-2 space-x-4"
                                      >
                                        {/* Avatar */}
                                        <div className="flex items-center space-x-4">
                                          <img
                                            src="https://via.placeholder.com/40" // Thay bằng URL avatar thực tế
                                            alt={account.attribute1}
                                            className="w-10 h-10 rounded-full"
                                          />
                                          {/* Tên và số tài khoản */}
                                          <div>
                                            <p className="text-sm font-medium text-black">{account.attribute1}</p>
                                            <p className="text-xs font-bold text-gray-400">{account.attribute2}</p>
                                          </div>
                                        </div>
                                        {/* Mũi tên */}
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

                  <FormField
                    control={form.control}
                    name="saveBeneficiary"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center mt-4 space-x-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            id="saveAsBeneficiary"
                            className="w-5 h-5 text-blue-500 rounded"
                            checked={isSaveBeneficiary}
                            onChange={(e) => {
                              setIsSaveBeneficiary(e.target.checked);
                              field.onChange(e.target.checked);
                            }}
                          />
                          <label htmlFor="saveAsBeneficiary" className="text-white text-sm">
                            Save as Beneficiary
                          </label>

                          {/* Input Memory (hiển thị khi checkbox được chọn) */}
                          {isSaveBeneficiary && (
                            <input
                              type="text"
                              placeholder="Enter memory"
                              className="form-input w-1/2 bg-gray-900 text-white rounded-xl px-4 py-2 border border-gray-800 focus:outline-none"
                              value={memory}
                              onChange={(e) => setMemory(e.target.value)}
                            />
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    {/* Amount */}
                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <label className="block text-gray-400 text-sm mb-1">Purpose</label>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Purpose"
                              {...field}
                              className="w-full py-6 px-4 bg-gray-900 text-white rounded-xl border border-gray-800 focus:outline-none"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>


                  {/* Fee Payer */}
                  <FormField
                    control={form.control}
                    name="feePayer"
                    render={({ field }) => (
                      <FormItem>
                        <label className="block text-gray-400 text-sm mb-2">Fee Payer</label>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            {/* Checkbox for Sender Pay */}
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio" value="Sender Pay"
                                checked={field.value === "Sender Pay"}
                                onChange={() =>
                                  field.onChange(field.value === "Sender Pay" ? "" : "Sender Pay")
                                }
                                className="w-5 h-5 text-blue-500 rounded"
                              />
                              <span className="text-white text-sm">Sender Pay</span>
                            </label>

                            {/* Checkbox for Receiver Pay */}
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio" value="Receiver Pay"
                                checked={field.value === "Receiver Pay"}
                                onChange={() =>
                                  field.onChange(field.value === "Receiver Pay" ? "" : "Receiver Pay")
                                }
                                className="w-5 h-5 text-blue-500 rounded"
                              />
                              <span className="text-white text-sm">Receiver Pay</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full"
                  >
                    Transfer
                  </Button>
                </form>
              </Form>
            ) : activeStep === "otp" ? (

              <Form {...formOtpSameBank}>
                <form onSubmit={formOtpSameBank.handleSubmit(onSubmitSameBankOTP)} className="w-full space-y-6">
                  <div className="mt-6">
                    <h3 className="text-white text-lg text-center font-bold mb-4">Enter OTP</h3>

                    {/* Source Account */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Source Account:</p>
                      <p className="text-white font-bold">{formOtpSameBank.getValues("own_account_number")}</p>
                    </div>

                    {/* Beneficiary Account */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Transfer To:</p>
                      <p className="text-white font-bold">
                        {formOtpSameBank.getValues("target").name} - {formOtpSameBank.getValues("target").account_number}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Amount:</p>
                      <p className="text-white font-bold">{formOtpSameBank.getValues("amount")} VND</p>
                    </div>

                    {/* Remarks */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Purpose:</p>
                      <p className="text-white font-bold">{formOtpSameBank.getValues("remarks")}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Fee Payer:</p>
                      <p className="text-white font-bold">{formOtpSameBank.getValues("payment_method")}</p>
                    </div>

                    {/* OTP Input */}
                    <FormField
                      control={formOtpSameBank.control}
                      name="otp"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter OTP"
                              {...field}
                              className={`w-full py-5 px-6 bg-white text-black text-lg rounded-xl border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                } focus:outline-none`}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-red-500 text-sm mt-2">{fieldState.error.message}</p>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="mt-4 w-full py-3 bg-blue-500 text-white font-bold rounded-full"
                    >
                      Verify
                    </Button>
                  </div>
                </form>
              </Form>)
              :
              (
                <div className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Icon Success */}
                    <div className="bg-green-500 p-4 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>

                    {/* Message */}
                    <h2 className="text-xl font-bold text-green-500">Transfer Successful!</h2>
                    <p className="text-2xl font-bold text-white">{formOtpSameBank.getValues("amount")} VND</p>
                    <p className="text-gray-400">{new Date().toLocaleTimeString()} - {new Date().toLocaleDateString()}</p>

                    {/* Account Details */}
                    <div className="text-white">
                      <p className="font-bold">{formOtpSameBank.getValues("target").account_number} - {formOtpSameBank.getValues("target").name}</p>
                      <p className="text-gray-400">{formOtpSameBank.getValues("remarks")}</p>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => {
                        setActiveStep("transfer"); // Reset về bước đầu
                        form.reset(); // Reset form transfer
                        formOtpSameBank.reset(); // Reset form OTP
                      }}
                      className="mt-6 py-3 px-6 bg-[#B9FF66] text-black font-bold rounded-full"
                    >
                      New Transaction
                    </button>
                  </div>
                </div>
              )
          )
            : (
              activeStep === "transfer" ? (
                <Form {...formInterBank}>
                  <form onSubmit={formInterBank.handleSubmit(
                    onSubmitInterBank,
                    (errors) => {
                      console.error("Validation errors:", errors);
                    }
                  )} className="w-full space-y-6">
                    <FormField
                      control={formInterBank.control}
                      name="transferFrom"
                      render={({ field }) => (
                        <FormItem>
                          <label className="block text-white text-sm mb-2">Transfer From</label>
                          <FormControl>
                            <input
                              type="text"
                              readOnly
                              className="w-full form-input bg-gray-900 text-white rounded-xl px-4 py-2 border border-gray-800 focus:outline-none cursor-not-allowed"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formInterBank.control}
                      name="toBank"
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem>
                            <label className="block text-white text-sm mb-2">To Bank</label>
                            <FormControl>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className={`w-full form-select bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? 'border-red-500' : 'border-gray-800'
                                      } focus:outline-none hover:border-white transition-all duration-200 text-left`}
                                  >
                                    {toBankValue || 'Select Bank'}
                                  </button>

                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-full">
                                  <DropdownMenuLabel>Select Bank</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <div className="px-2 py-2">
                                    <input
                                      type="text"
                                      placeholder="Search banks..."
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none rounded-xl focus:ring focus:ring-blue-500 text-white"
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                  </div>
                                  <DropdownMenuSeparator />
                                  {banks
                                    .filter((bank) =>
                                      bank.attribute1.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((bank) => (
                                      <DropdownMenuItem
                                        key={bank.attribute1}
                                        onClick={() => {
                                          formInterBank.setValue('toBank', bank.attribute1);
                                          formInterBank.setValue('transferTo', '');
                                          setAccountNumberInput('');
                                          setSelectedTransferToInterBank(null);
                                        }}
                                        className="flex items-center justify-between px-4 py-2 space-x-4"
                                      >
                                        <div className="flex items-center space-x-4">
                                          <img
                                            src={'https://via.placeholder.com/40'}
                                            alt={bank.attribute1}
                                            className="w-10 h-10 rounded-full"
                                          />
                                          <div>
                                            <p className="text-sm font-medium text-black">{bank.attribute1}</p>
                                          </div>
                                        </div>
                                        <span className="text-gray-400 text-sx">{'>'}</span>
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </FormControl>

                            {fieldState.error && (
                              <FormMessage className="text-red-500 text-sm">
                                {fieldState.error.message}
                              </FormMessage>
                            )}
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={formInterBank.control}
                      name="transferTo"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <label className="block text-white text-sm mb-2">Transfer To</label>
                          <FormControl>
                            <div className="flex justify-between items-center space-x-3">
                              {/* Input Field */}
                              <input
                                type="text"
                                placeholder="Enter account number"
                                value={selectedTransferToInterBank?.attribute2 || accountNumberInput} // Hiển thị attribute2 hoặc giá trị nhập
                                className={`w-1/2 form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? 'border-red-500' : 'border-gray-800'
                                  } focus:outline-none`}
                                onChange={(e) => {
                                  setAccountNumberInput(e.target.value);
                                  handleTransferToInputChangeInterBank(e);
                                }}
                              />
                              <div className="w-1/2 relative">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className={`w-full form-select bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? 'border-red-500' : 'border-gray-800'
                                        } focus:outline-none hover:border-white transition-all duration-200`}
                                    >
                                      {selectedTransferToInterBank?.attribute1 && selectedTransferToInterBank?.attribute2
                                        ? `${selectedTransferToInterBank.attribute1} - ${selectedTransferToInterBank.attribute2}`
                                        : 'Select Beneficiary Account'}
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
                                    {interBankAccounts
                                      .filter((interBankAccount) =>
                                        `${interBankAccount.attribute1} - ${interBankAccount.attribute2} - ${interBankAccount.attribute3}`
                                          .toLowerCase()
                                          .includes(searchQuery.toLowerCase())
                                      )
                                      .map((interBankAccount) => (
                                        <DropdownMenuItem
                                          key={interBankAccount.attribute2}
                                          onClick={() => {
                                            setSelectedTransferToInterBank(interBankAccount);
                                            const selectedValue = `${interBankAccount.attribute1} - ${interBankAccount.attribute2}`;
                                            formInterBank.setValue('transferTo', selectedValue, { shouldValidate: true });
                                            formInterBank.setValue('toBank', interBankAccount.attribute3);
                                            setToBankValue(interBankAccount.attribute3);
                                          }}
                                          className="flex items-center justify-between px-4 py-2 space-x-4"
                                        >
                                          <div className="flex items-center space-x-4">
                                            <img
                                              src="https://via.placeholder.com/40"
                                              alt={interBankAccount.attribute1}
                                              className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                              <p className="text-sm font-medium text-black">{interBankAccount.attribute1}</p>
                                              <p className="text-xs font-bold text-gray-400">{interBankAccount.attribute2}</p>
                                              <p className="text-xs font-bold text-gray-400">{interBankAccount.attribute3}</p>
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


                    <FormField
                      control={formInterBank.control}
                      name="saveBeneficiary"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center mt-4 space-x-3">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              id="saveAsBeneficiary"
                              className="w-5 h-5 text-blue-500 rounded"
                              checked={isSaveBeneficiary}
                              onChange={(e) => {
                                setIsSaveBeneficiary(e.target.checked);
                                field.onChange(e.target.checked);
                              }}
                            />
                            <label htmlFor="saveAsBeneficiary" className="text-white text-sm">
                              Save as Beneficiary
                            </label>

                            {/* Input Memory (hiển thị khi checkbox được chọn) */}
                            {isSaveBeneficiary && (
                              <input
                                type="text"
                                placeholder="Enter memory"
                                className="form-input w-1/2 bg-gray-900 text-white rounded-xl px-4 py-2 border border-gray-800 focus:outline-none"
                                value={memory}
                                onChange={(e) => setMemory(e.target.value)}
                              />
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4">
                      {/* Amount */}
                      <FormField
                        control={formInterBank.control}
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
                        control={formInterBank.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <label className="block text-gray-400 text-sm mb-1">Purpose</label>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Purpose"
                                {...field}
                                className="w-full py-6 px-4 bg-gray-900 text-white rounded-xl border border-gray-800 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>


                    {/* Fee Payer */}
                    <FormField
                      control={formInterBank.control}
                      name="feePayer"
                      render={({ field }) => (
                        <FormItem>
                          <label className="block text-gray-400 text-sm mb-2">Fee Payer</label>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              {/* Checkbox for Sender Pay */}
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio" value="Sender Pay"
                                  checked={field.value === "Sender Pay"}
                                  onChange={() =>
                                    field.onChange(field.value === "Sender Pay" ? "" : "Sender Pay")
                                  }
                                  className="w-5 h-5 text-blue-500 rounded"
                                />
                                <span className="text-white text-sm">Sender Pay</span>
                              </label>

                              {/* Checkbox for Receiver Pay */}
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio" value="Receiver Pay"
                                  checked={field.value === "Receiver Pay"}
                                  onChange={() =>
                                    field.onChange(field.value === "Receiver Pay" ? "" : "Receiver Pay")
                                  }
                                  className="w-5 h-5 text-blue-500 rounded"
                                />
                                <span className="text-white text-sm">Receiver Pay</span>
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full"
                    >
                      Transfer
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitInterBankOTP)} className="w-full space-y-6">
                    <div className="mt-6">
                      <h3 className="text-white text-lg text-center font-bold mb-4">Confirm Transfer</h3>

                      {/* Các thông tin xác nhận được căn chỉnh với justify-between */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Transfer From:</p>
                        <p className="text-white font-bold">{formData?.transferFrom}</p>
                      </div>

                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Transfer To:</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white  font-bold">{formData?.toBank}</p>
                          <span className="text-gray-400 text-sx">{'-'}</span>
                          <p className="text-white font-bold">{formData?.transferTo}</p>
                        </div>
                      </div>

                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Amount:</p>
                        <p className="text-white font-bold">{formData?.amount} VND</p>
                      </div>

                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Purpose:</p>
                        <p className="text-white font-bold">{formData?.purpose}</p>
                      </div>

                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Fee Payer:</p>
                        <p className="text-white font-bold">{formData?.feePayer}</p>
                      </div>

                      {/* Nhập OTP */}
                      <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter OTP"
                                {...field}
                                className="w-full py-5 px-6 bg-white text-black text-lg rounded-xl border border-gray-800 focus:outline-none"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />


                      {/* Nút Verify */}
                      <Button
                        type="submit"
                        className="mt-4 w-full py-3 bg-blue-500 text-white font-bold rounded-full"
                      >
                        Verify
                      </Button>
                    </div>

                  </form>
                </Form>
              ))
          }
        </div>
        <div className="mt-8 p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Transaction</h3>
            <button className="flex bg-black items-center text-sm font-medium hover:underline" onClick={() => navigate('/dashboard/transaction-history')}>
              See All
              <span className="ml-2 flex justify-center items-center w-6 h-6 bg-black border border-white text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left border-b text-green-400 border-gray-700">
                <th className="py-2">Name</th>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  John
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$80.09</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  John
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$80.09</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div >
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
        <div className="border border-white/20 bg-black p-6 rounded-3xl shadow-md shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)]">
          <h3 className="text-xl font-bold mb-4">Favorite Beneficiaries</h3>
          <div className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200">
            <div className="flex items-center w-1/2">
              <img src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-bold">John Paul</p>
                <p className="text-gray-500 text-sm">1234567890122937</p>
              </div>
            </div>
            {/* Repeat for other beneficiaries */}
          </div>
          <div className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200">
            <div className="flex items-center w-1/2">
              <img src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-bold">John Paul</p>
                <p className="text-gray-500 text-sm">1234567890122937</p>
              </div>
            </div>
            {/* Repeat for other beneficiaries */}
          </div>
          <div className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200">
            <div className="flex items-center w-1/2">
              <img src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-bold">John Paul</p>
                <p className="text-gray-500 text-sm">1234567890122937</p>
              </div>
            </div>
            {/* Repeat for other beneficiaries */}
          </div>
        </div>
      </div>
    </div >
  );
};

export default TransferUI;