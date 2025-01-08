import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import currencyHelper from "@/helper/currencyHelper";
import ReactCodeInput from "react-code-input";

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
import { fetchAccountInfo, fetchTransactionTarget, saveBeneficiary } from "@/libs/slices/sliceAccount";
import timeStampHelper from "@/helper/convertTimeStamp";
import { createExternalTransaction, createInternalTransaction, fetchAccountTransaction, sendOtpTransactionSameBank, TransactionRecord } from "@/libs/slices/sliceTransaction";
import { toast } from "react-toastify";
import { fetchBankById, fetchExternalAccount, fetchExternalBanks } from "@/libs/slices/sliceExternalBank";
import { DialogContent } from "@/components/ui/dialog";
import { Transaction, transactionColumns } from "../Resusable/columns";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { DataTable } from "../Resusable/dataTable";
import { Dialog } from "@/components/ui/dialog";
import { interactDetailDialog } from "@/libs/slices/sliceTask";
import { DateRange } from "react-day-picker";

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
  toBankInterbank: z.string().nonempty({ message: "Please select a bank account." }),
  transferToInterbank: z.string().nonempty({ message: "Please select a beneficiary account." }),
  amountInterbank: z
    .string()
    .nonempty({ message: "Amount is required." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount." }),
  purposeInterbank: z.string().nonempty({ message: "Purpose is required." }),
  feePayerInterbank: z.string().nonempty({ message: "Please select a fee payer." }),
});

const OtpFormSchemaInterBank = z.object({
  our_bank_account_number: z.string().nonempty({ message: "Source account is required." }),
  otp: z
    .string()
    .nonempty({ message: "OTP is required." })
    .regex(/^\d{6}$/, { message: "OTP must be a 6-digit number." }),
  client_bank_account_number: z.string().nonempty({ message: "Beneficiary account number is required." }),
  client_bank_name: z.string().nonempty({ message: "Beneficiary name is required." }),
  payment_method: z.string().nonempty({ message: "Payment method is required." }),
  amount: z
    .number()
    .min(0.01, { message: "Amount must be greater than 0." }),
  remarks: z.string().optional(),
});

const TransferUI = () => {
  const { isOpenDetailDialog } = useAppSelector(state => state.task);
  const [activeTab, setActiveTab] = useState("sameBank");
  const [activeStep, setActiveStep] = useState("transfer"); // New state for tracking steps
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error, accountInfo } = useAppSelector(state => state.account);
  const [searchQuery, setSearchQuery] = useState("");

  const recipients = accountInfo.recipient_list?.[0]?.recipient_list || [];

  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
  const [selectedTransferToInterBank, setSelectedTransferToInterBank] = useState<{ attribute1: string; attribute2: string } | null>(null);

  const setActiveTabAndCloseDropdowns = (tab: string) => {
    setActiveTab(tab);
  };

  const form = useForm({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      transferFrom: "",
      transferTo: "",
      amount: "",
      purpose: "",
      feePayer: "",
      saveBeneficiary: "",
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
      transferFrom: "",
      toBankInterbank: "",
      transferToInterbank: "",
      amountInterbank: "",
      purposeInterbank: "",
      feePayerInterbank: "",
      saveBeneficiaryInterbank: "",
    },
  });

  const { reset: resetFormInterBank } = formInterBank;

  useEffect(() => {
    if (accountInfo?.name && accountInfo?.account_number) {
      resetFormInterBank({
        transferFrom: `${accountInfo.name} - ${accountInfo.account_number}`,
        toBankInterbank: "",
        transferToInterbank: "",
        amountInterbank: "",
        purposeInterbank: "",
        feePayerInterbank: "",
      });
    }
  }, [accountInfo.name, accountInfo.account_number, resetFormInterBank]);


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


  const formOtpInterBank = useForm({
    resolver: zodResolver(OtpFormSchemaInterBank),
    defaultValues: {
      our_bank_account_number: "",
      otp: "",
      client_bank_account_number: "",
      client_bank_name: "",
      payment_method: "Sender Pay",
      amount: 0,
      remarks: "",
    },
  });

  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setDisplayedTransactions(
      converTypeHelper.convertToCustomerTransacrionColumns(filterByDate, accountInfo.account_number).slice(-5)
    );
  }, [accountInfo.account_balance]);


  function onSubmitSameBank(data: any) {
    const [, ownAccountNumber] = data.transferFrom.split(" - ");
    const [targetName, targetAccountNumber] = data.transferTo.split(" - ");

    if (isSaveBeneficiary && !memory.trim()) {
      form.setError("saveBeneficiary", {
        type: "manual",
        message: "Please enter a memorable name for the beneficiary.",
      });
      return;
    }

    formOtpSameBank.setValue("own_account_number", ownAccountNumber);
    formOtpSameBank.setValue("otp", "");
    formOtpSameBank.setValue("target.account_number", targetAccountNumber);
    formOtpSameBank.setValue("target.name", targetName);
    formOtpSameBank.setValue("payment_method", data.feePayer);
    formOtpSameBank.setValue("amount", parseFloat(data.amount));
    formOtpSameBank.setValue("remarks", data.purpose);

    console.log("Updated formOtpSameBank:", formOtpSameBank.getValues());

    setActiveStep("otp");

    dispatch(sendOtpTransactionSameBank(data))
      .unwrap()
      .then((response: any) => {
        console.log("Transaction created successfully:", response);

        if (isSaveBeneficiary) {
          const beneficiaryData = {
            account_number: targetAccountNumber,
            bank_id: "6750a0c9a9dc441ad3fbfb9f",
            reminder_name: memory,
          };

          dispatch(saveBeneficiary(beneficiaryData))
            .unwrap()
            .then((res) => {
              console.log("Beneficiary saved successfully:", res);
              toast.success("Beneficiary saved successfully!");
              dispatch(fetchAccountInfo());
            })
            .catch((err) => {
              console.error("Failed to save beneficiary:", err);
              toast.error("Failed to fetch updated recipients!");
            });
        }
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
      });
  }

  function onSubmitSameBankOTP(data: any) {
    dispatch(createInternalTransaction(data))
      .unwrap()
      .then((response: any) => {
        console.log("Transaction response:", response);

        if (response.isOTPValid && response.success) {
          toast.success("Transaction created successfully!");
          setActiveStep("transferSuccess");
          dispatch(fetchAccountInfo());
          dispatch(fetchAccountTransaction(accountInfo.account_number))
            .unwrap()
            .then((transactions) => {
              setDisplayedTransactions(
                converTypeHelper.convertToCustomerTransacrionColumns(transactions, accountInfo.account_number).slice(-5)
              );
            });
        } else {
          const errorMessage = response.message || "Transaction failed!";
          toast.error(errorMessage);
          console.error("Transaction validation failed:", errorMessage);
        }
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
        toast.error("Failed to create Transaction!")
      });
  }

  function onSubmitInterBank(data: any) {
    const [, ownAccountNumber] = data.transferFrom.split(" - ");
    const [, targetAccountNumber] = data.transferToInterbank.split(" - ");

    if (isSaveBeneficiary && !memory.trim()) {
      formInterBank.setError("saveBeneficiaryInterbank", {
        type: "manual",
        message: "Please enter a memorable name for the beneficiary.",
      });
      return;
    }

    formOtpInterBank.setValue("our_bank_account_number", ownAccountNumber);
    formOtpInterBank.setValue("otp", "");
    formOtpInterBank.setValue("client_bank_account_number", targetAccountNumber);
    formOtpInterBank.setValue("client_bank_name", data.toBankInterbank);
    formOtpInterBank.setValue("payment_method", data.feePayerInterbank);
    formOtpInterBank.setValue("amount", parseFloat(data.amountInterbank));
    formOtpInterBank.setValue("remarks", data.purposeInterbank);

    console.log("Updated formOtpSameBank:", formOtpInterBank.getValues());

    setActiveStep("otp");

    dispatch(sendOtpTransactionSameBank(data))
      .unwrap()
      .then((response: any) => {
        console.log("Transaction created successfully:", response);
        if (isSaveBeneficiary) {
          const beneficiaryData = {
            account_number: targetAccountNumber,
            bank_id: selectedBankId,
            reminder_name: memory,
          };
          console.log("beneficiary inter: ", selectedBankId);
          dispatch(saveBeneficiary(beneficiaryData))
            .unwrap()
            .then((res) => {
              console.log("Beneficiary saved successfully:", res);
              toast.success("Beneficiary saved successfully!");
              dispatch(fetchAccountInfo());
            })
            .catch((err) => {
              console.error("Failed to save beneficiary:", err);
              toast.error("Failed to fetch updated recipients!");
            });
        }
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
      });
  }

  function onSubmitInterBankOTP(data: any) {
    console.log("bankId after moving to otp:", selectedBankId);
    dispatch(
      createExternalTransaction({
        transactionData: data,
        clientId: selectedBankId,
      })
    ).unwrap()
      .then(() => {
        setActiveStep("transferSuccess");
        toast.success("External Transaction created successfully!");
        dispatch(fetchAccountInfo());
      })
      .catch((error) => {
        console.error("Error creating External transaction:", error);
        toast.error("Failed to create External Transaction!")
      });
  }

  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChangeSameBank = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    form.setValue("transferTo", "");
    setSelectedTransferTo({ attribute1: "", attribute2: "" });
    form.clearErrors("transferTo");
  };

  const [selectedBankId, setSelectedBankId] = useState("");


  const handleInputChangeInterBank = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (formInterBank.getValues("transferToInterbank") && formInterBank.getValues("toBankInterbank") && selectedBankId) {
      formInterBank.setValue("transferToInterbank", "", { shouldValidate: true });
      formInterBank.setValue("toBankInterbank", "", { shouldValidate: true });
      setSelectedBankId("");
      setSelectedTransferToInterBank({ attribute1: "", attribute2: "" });
      formInterBank.clearErrors("transferToInterbank");
    }
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
      })
      .catch(() => {
        form.setError("transferTo", {
          type: "manual",
          message: "No account number found",
        });
      });
  };

  const handleFetchTargetDataInterBank = () => {
    const trimmedInput = inputValue.trim();

    if (!trimmedInput) {
      formInterBank.setError("transferToInterbank", {
        type: "manual",
        message: "Please enter a valid account number",
      });
      return;
    }

    if (formInterBank.getValues("toBankInterbank") == "") {
      console.log("bank is empty")
      formInterBank.setError("toBankInterbank", {
        type: "manual",
        message: "Please select bank",
      });
    }

    const transferFrom = formInterBank.getValues("transferFrom");

    dispatch(fetchExternalAccount({ account_number: trimmedInput, bank_id: selectedBankId }))
      .unwrap()
      .then((data) => {
        if (transferFrom && transferFrom.includes(data.account_number)) {
          formInterBank.setError("transferToInterbank", {
            type: "manual",
            message: "You cannot transfer to yourself",
          });
          return;
        }

        setSelectedTransferToInterBank({
          attribute1: data.name,
          attribute2: data.account_number,
        });

        formInterBank.setValue(
          "transferToInterbank",
          `${data.name} - ${data.account_number}`
        );
      })
      .catch(() => {
        toast.error("No account found! Please fetch or select valid account");
        formInterBank.setError("transferToInterbank", {
          type: "manual",
          message: "Please enter a valid account number",
        });
      });
  };

  const [isSaveBeneficiary, setIsSaveBeneficiary] = useState(false);
  const [memory, setMemory] = useState("");

  const [toBankValue, setToBankValue] = useState('');

  useEffect(() => {
    const subscription = formInterBank.watch((value) => {
      setToBankValue(value.toBankInterbank || '');
    });
    return () => subscription.unsubscribe();
  }, [formInterBank]);

  const { banks } = useAppSelector((state) => state.externalBanks);

  useEffect(() => {
    dispatch(fetchExternalBanks());
  }, [dispatch]);

  const [recipientInterBank, setRecipientInterBank] = useState<
    { bank_name: string; account_number: string; reminder_name: string, bank_id: string }[]
  >([]);

  useEffect(() => {
    const fetchAndFilterRecipients = async () => {
      const filteredRecipients = recipients.filter(
        (recipient) => recipient.bank_id !== "6750a0c9a9dc441ad3fbfb9f"
      );

      const updatedRecipients = await Promise.all(
        filteredRecipients.map(async (recipient) => {
          try {
            const bank = await dispatch(fetchBankById(recipient.bank_id)).unwrap();
            return {
              bank_name: bank.name,
              account_number: recipient.account_number,
              reminder_name: recipient.reminder_name,
              bank_id: bank.bank_id
            };
          } catch (error) {
            console.error(
              `Failed to fetch bank name for bank_id: ${recipient.bank_id}`,
              error
            );
            return null;
          }
        })
      );
      setRecipientInterBank(updatedRecipients.filter((r) => r !== null));
    };
    fetchAndFilterRecipients();
  }, [accountInfo.recipient_list, dispatch]);

  const handleErrors = (errors: FieldErrors) => {
    console.error("Validation errors:", errors);

    Object.values(errors).forEach((error) => {
      const err = error as { message?: string };
      if (err?.message) {
        toast.error(err.message);
      }
    });
  };

  const { transactions, loading, selectedTransaction } = useAppSelector(state => state.transaction);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const filterByDate = useMemo(() => {
    return transactions.filter((item: TransactionRecord) => {
      const { transaction_date } = item;
      let isValid = true;
      if (isValid && date?.from) {
        isValid = timeStampHelper.formatTimestamp(transaction_date || "") >= timeStampHelper.formatTimestamp(date.from.toISOString()) ? true : false;
      }
      if (isValid && date?.to) {
        isValid = timeStampHelper.formatTimestamp(transaction_date || "") <= timeStampHelper.formatTimestamp(date.to.toISOString()) ? true : false;
      }
      return isValid;
    });
  }, [date, transactions]);

  useEffect(() => {
    if (accountInfo.account_number) {
      console.log("Fetching Transaction History");
      dispatch(fetchAccountTransaction(accountInfo.account_number))
      .unwrap()
      .then((transactions) => {
        setDisplayedTransactions(
          converTypeHelper.convertToCustomerTransacrionColumns(transactions, accountInfo.account_number).slice(-5)
        );
      });
    }
    console.log("CALLED!")
  }, [accountInfo.account_number]);

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
                <form onSubmit={form.handleSubmit(onSubmitSameBank, handleErrors)} className="w-full space-y-6">
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
                                  {recipients
                                    .filter((account) => account.bank_id === "6750a0c9a9dc441ad3fbfb9f" &&
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
                                          setInputValue(account.account_number);
                                          console.log("Selected transfer", selectedTransferTo)
                                          field.onChange(`${account.reminder_name} - ${account.account_number}`);
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

                          {isSaveBeneficiary && (
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Enter memory"
                                className={`form-input w-full bg-gray-900 text-white rounded-xl px-4 py-2 border ${form.formState.errors.saveBeneficiary ? "border-red-500" : "border-gray-800"} focus:outline-none`}
                                value={memory}
                                onChange={(e) => {
                                  setMemory(e.target.value);
                                  form.clearErrors("saveBeneficiary");
                                }}
                              />
                              {form.formState.errors.saveBeneficiary && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.saveBeneficiary.message}
                                </p>
                              )}
                            </div>
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

                            {/* Checkbox for Recipient Pay */}
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio" value="Recipient Pay"
                                checked={field.value === "Recipient Pay"}
                                onChange={() =>
                                  field.onChange(field.value === "Recipient Pay" ? "" : "Recipient Pay")
                                }
                                className="w-5 h-5 text-blue-500 rounded"
                              />
                              <span className="text-white text-sm">Recipient Pay</span>
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

                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Amount:</p>
                      <p className="text-white font-bold">
                        {formOtpSameBank
                          .getValues("amount")
                          ?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </p>
                    </div>

                    {/* Remarks */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Purpose:</p>
                      <p className="text-white font-bold">{formOtpSameBank.getValues("remarks")}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Fee Payer:</p>
                      <p className="text-white font-bold">
                        {(() => {
                          const paymentMethod = formOtpSameBank.getValues("payment_method");
                          const amount = formOtpSameBank.getValues("amount");
                          if (paymentMethod === "Recipient Pay") {
                            return `0đ (Recipient Pay)`;
                          } else if (paymentMethod === "Sender Pay") {
                            const fee = amount * 0.1;
                            return `${fee.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} (Sender Pay)`;
                          }
                          return "Unknown";
                        })()}
                      </p>
                    </div>

                    <div className="border-t border-gray-600 my-4"></div>

                    {/* Total Amount */}
                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Total Amount:</p>
                      <p className="text-green-400 font-bold text-xl">
                        {(() => {
                          const paymentMethod = formOtpSameBank.getValues("payment_method");
                          const amount = formOtpSameBank.getValues("amount");
                          if (paymentMethod === "Recipient Pay") {
                            return `${amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`;
                          } else if (paymentMethod === "Sender Pay") {
                            const fee = amount * 0.1;
                            const total = amount + fee;
                            return `${total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`;
                          }
                          return "Unknown";
                        })()}
                      </p>
                    </div>


                    {/* OTP Input */}
                    <div className="border-t border-gray-600 my-4"></div>

                    <div className="mb-4 flex flex-col items-center">
                      <p className="text-white text-sm mb-4">Enter OTP sending to your email!</p>
                      <FormField
                        control={formOtpSameBank.control}
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
                    handleErrors,
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
                      name="toBankInterbank"
                      render={({ fieldState }) => {
                        console.log("get state error: ", fieldState.error)
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
                                    .map((bank) => (
                                      <DropdownMenuItem
                                        key={bank.name}
                                        onClick={() => {
                                          formInterBank.setValue("toBankInterbank", bank.name, { shouldValidate: true });
                                          formInterBank.setValue("transferToInterbank", "", { shouldValidate: true });
                                          setSelectedTransferToInterBank(null);
                                          setToBankValue(bank.name);
                                          setSelectedBankId(bank.bank_id);
                                        }}
                                        className="flex items-center justify-between px-4 py-2 space-x-4"
                                      >
                                        <div className="flex items-center space-x-4">
                                          <img
                                            src={'https://via.placeholder.com/40'}
                                            alt={bank.name}
                                            className="w-10 h-10 rounded-full"
                                          />
                                          <div>
                                            <p className="text-sm font-medium text-black">{bank.name}</p>
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
                      name="transferToInterbank"
                      render={({ field, fieldState }) => {
                        console.log("Error State transfer to:", fieldState.error);
                        return (
                          <FormItem>
                            <label className="block text-white text-sm mb-2">Transfer To</label>
                            <FormControl>
                              <div className="flex justify-between items-center space-x-3">
                                <div className={`relative w-1/2 form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                  } focus:outline-none`}>
                                  <input
                                    type="text"
                                    placeholder="Enter account number"
                                    value={inputValue}
                                    className={`w-full bg-gray-900 text-white rounded-xl focus:outline-none`}
                                    onChange={handleInputChangeInterBank}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleFetchTargetDataInterBank();
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleFetchTargetDataInterBank}
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
                                <div className="w-1/2 relative">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className={`w-full form-select bg-gray-900 text-white rounded-xl px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-800'
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
                                      {recipientInterBank
                                        .filter((interBankAccount) =>
                                          `${interBankAccount.bank_name} - ${interBankAccount.reminder_name} - ${interBankAccount.account_number}`
                                            .toLowerCase()
                                            .includes(searchQuery.toLowerCase())
                                        )
                                        .map((interBankAccount) => (
                                          <DropdownMenuItem
                                            key={interBankAccount.account_number}
                                            onClick={() => {
                                              setSelectedTransferToInterBank({
                                                attribute1: interBankAccount.reminder_name,
                                                attribute2: interBankAccount.account_number,
                                              });
                                              const selectedValue = `${interBankAccount.reminder_name} - ${interBankAccount.account_number}`;
                                              formInterBank.setValue('transferToInterbank', selectedValue, { shouldValidate: true });
                                              formInterBank.setValue('toBankInterbank', interBankAccount.bank_name);
                                              setSelectedBankId(interBankAccount.bank_id);
                                              setToBankValue(interBankAccount.bank_name);
                                              setInputValue(interBankAccount.account_number)
                                              field.onChange(`${interBankAccount.reminder_name} - ${interBankAccount.account_number}`);
                                            }}
                                            className="flex items-center justify-between px-4 py-2 space-x-4"
                                          >
                                            <div className="flex items-center space-x-4">
                                              <img
                                                src="https://via.placeholder.com/40"
                                                alt={interBankAccount.account_number}
                                                className="w-10 h-10 rounded-full"
                                              />
                                              <div>
                                                <p className="text-sm font-medium text-black">{interBankAccount.reminder_name}</p>
                                                <p className="text-xs font-bold text-gray-400">{interBankAccount.account_number}</p>
                                                <p className="text-xs font-bold text-gray-400">{interBankAccount.bank_name}</p>
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
                        )
                      }}
                    />

                    <FormField
                      control={formInterBank.control}
                      name="saveBeneficiaryInterbank"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center mt-4 space-x-3">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              id="saveAsBeneficiaryInterbank"
                              className="w-5 h-5 text-blue-500 rounded"
                              checked={isSaveBeneficiary}
                              onChange={(e) => {
                                setIsSaveBeneficiary(e.target.checked);
                                field.onChange(e.target.checked);
                              }}
                            />
                            <label htmlFor="saveAsBeneficiaryInterbank" className="text-white text-sm">
                              Save as Beneficiary
                            </label>

                            {isSaveBeneficiary && (
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Enter memory"
                                  className={`form-input w-full bg-gray-900 text-white rounded-xl px-4 py-2 border ${formInterBank.formState.errors.saveBeneficiaryInterbank ? "border-red-500" : "border-gray-800"} focus:outline-none`}
                                  value={memory}
                                  onChange={(e) => {
                                    setMemory(e.target.value);
                                    formInterBank.clearErrors("saveBeneficiaryInterbank");
                                  }}
                                />
                                {formInterBank.formState.errors.saveBeneficiaryInterbank && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {formInterBank.formState.errors.saveBeneficiaryInterbank.message}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4">
                      {/* Amount */}
                      <FormField
                        control={formInterBank.control}
                        name="amountInterbank"
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
                        name="purposeInterbank"
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
                      name="feePayerInterbank"
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

                              {/* Checkbox for Recipient Pay */}
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio" value="Recipient Pay"
                                  checked={field.value === "Recipient Pay"}
                                  onChange={() =>
                                    field.onChange(field.value === "Recipient Pay" ? "" : "Recipient Pay")
                                  }
                                  className="w-5 h-5 text-blue-500 rounded"
                                />
                                <span className="text-white text-sm">Recipient Pay</span>
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
                      className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full hover:bg-white"
                    >
                      Transfer
                    </Button>
                  </form>
                </Form>
              ) : activeStep === "otp" ? (
                <Form {...formOtpInterBank}>
                  <form onSubmit={formOtpInterBank.handleSubmit(onSubmitInterBankOTP)} className="w-full space-y-6">
                    <div className="mt-6">
                      <h3 className="text-white text-lg text-center font-bold mb-4">Enter OTP</h3>

                      {/* Source Account */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Source Account:</p>
                        <p className="text-white font-bold">{formOtpInterBank.getValues("our_bank_account_number")}</p>
                      </div>

                      {/* Beneficiary Account */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Transfer To:</p>
                        <p className="text-white font-bold">
                          {formOtpInterBank.getValues("client_bank_name")} - {formOtpInterBank.getValues("client_bank_account_number")}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Amount:</p>
                        <p className="text-white font-bold">
                          {formOtpInterBank
                            .getValues("amount")
                            ?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </p>
                      </div>

                      {/* Remarks */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Purpose:</p>
                        <p className="text-white font-bold">{formOtpInterBank.getValues("remarks")}</p>
                      </div>

                      {/* Payment Method */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Fee Payer:</p>
                        <p className="text-white font-bold">
                          {(() => {
                            const paymentMethod = formOtpInterBank.getValues("payment_method");
                            const amount = formOtpInterBank.getValues("amount");
                            if (paymentMethod === "Recipient Pay") {
                              return `0đ (Recipient Pay)`;
                            } else if (paymentMethod === "Sender Pay") {
                              const fee = amount * 0.1;
                              return `${fee.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} (Sender Pay)`;
                            }
                            return "Unknown";
                          })()}
                        </p>
                      </div>

                      <div className="border-t border-gray-600 my-4"></div>

                      {/* Total Amount */}
                      <div className="mb-4 flex justify-between">
                        <p className="text-gray-400">Total Amount:</p>
                        <p className="text-green-400 font-bold text-xl">
                          {(() => {
                            const paymentMethod = formOtpInterBank.getValues("payment_method");
                            const amount = formOtpInterBank.getValues("amount");
                            if (paymentMethod === "Recipient Pay") {
                              return `${amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`;
                            } else if (paymentMethod === "Sender Pay") {
                              const fee = amount * 0.1;
                              const total = amount + fee;
                              return `${total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`;
                            }
                            return "Unknown";
                          })()}
                        </p>
                      </div>

                      <div className="border-t border-gray-600 my-4"></div>

                      <div className="mb-4 flex flex-col items-center">
                        <p className="text-white text-sm mb-4">Enter OTP sending to your email!</p>
                        <FormField
                          control={formOtpInterBank.control}
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

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="mt-4 w-full py-3 bg-blue-500 text-white font-bold rounded-full hover:bg-white hover:text-black"
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
                      <p className="text-2xl font-bold text-white">{formOtpInterBank.getValues("amount")} VND</p>
                      <p className="text-gray-400">{new Date().toLocaleTimeString()} - {new Date().toLocaleDateString()}</p>

                      {/* Account Details */}
                      <div className="text-white">
                        <p className="font-bold">{formOtpInterBank.getValues("client_bank_name")} - {formOtpInterBank.getValues("client_bank_account_number")}</p>
                        <p className="text-gray-400">{formOtpInterBank.getValues("remarks")}</p>
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => {
                          setActiveStep("transfer"); // Reset về bước đầu
                          formInterBank.reset(); // Reset form transfer
                          formOtpInterBank.reset(); // Reset form OTP
                        }}
                        className="mt-6 py-3 px-6 bg-[#B9FF66] text-black font-bold rounded-full"
                      >
                        New Transaction
                      </button>
                    </div>
                  </div>
                ))
          }
        </div>
        <div className="mt-8 p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200">
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
          <div className="container mx-auto py-3">
            <DataTable columns={transactionColumns} data={displayedTransactions.slice(-5)} loading={loading} filterable={false} />
            <Dialog
              open={isOpenDetailDialog}
              onOpenChange={(data) => {
                console.log(data);
                dispatch(interactDetailDialog(data));
              }}
            >
              {/* <DialogTitle>Transaction Detail</DialogTitle> */}
              <DialogContent className="w-full max-w-md rounded-lg p-6 bg-white shadow-lg">
                <div className="flex flex-col items-center">
                  {/* Success Icon */}
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Title and Amount */}
                  <h2 className="text-xl font-bold text-gray-800 mt-4">{selectedTransaction?.status === "Transfered" ? "Transfer Successfull!" : "Receive Successfull!"}</h2>
                  <p className="text-green-600 text-3xl font-extrabold mt-2">{currencyHelper.convertToCurrency(selectedTransaction?.amount || 0)}</p>
                  <p className="text-gray-500 mt-2 text-sm">{timeStampHelper.formatTimestamp(selectedTransaction?.transaction_date || "")}</p>

                  {/* Bank Information */}
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <img
                        src="/path/to/dong-a-logo.png" // Replace with your actual logo URL
                        alt="Dong A Bank"
                        className="w-6 h-6"
                      />
                      <p className="text-gray-800 font-semibold">{selectedTransaction?.bankInfo}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{
                      selectedTransaction?.status === "Received" ?
                        selectedTransaction?.sender_info.account_number != "employee_placeholder" ?
                          `${selectedTransaction?.sender_info.account_number} - ${selectedTransaction?.sender_info.name}` : `${selectedTransaction?.sender_info.name}`
                        : `${selectedTransaction?.recipient_info.account_number} - ${selectedTransaction?.recipient_info.name}`
                    }</p>
                    <p className="text-sm text-gray-500">{selectedTransaction?.remarks}</p>
                  </div>

                  {/* New Transaction Button */}
                  <button
                    className="mt-6 bg-green-500 text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-green-600"
                    onClick={() => console.log("Start a new transaction")}
                  >
                    New Transaction
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
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
          {recipients.map((recipient, index) => (
            <div
              key={recipient.account_number || index}
              className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200"
            >
              <div className="flex items-center">
                <img
                  src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" // Thay bằng URL ảnh thực tế nếu có
                  alt="Avatar"
                  className="w-10 h-10 rounded-full mr-2 object-cover"
                />
                <div>
                  <p className="font-bold">{recipient.reminder_name}</p>
                  <p className="text-gray-500 text-sm">{recipient.account_number}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
};

export default TransferUI;