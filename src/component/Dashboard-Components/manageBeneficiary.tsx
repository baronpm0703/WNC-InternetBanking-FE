import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { beneficiaryColumns, inBeneficiaries } from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog } from "@/libs/slices/sliceTask";
import { Button } from "@/components/ui/button";
import { fetchRecipients, fetchTransactionTarget, saveBeneficiary } from "@/libs/slices/sliceAccount";
import { toast } from "react-toastify";
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

const SaveBeneficiarySameBankSchema = z.object({
    account_number: z.string().nonempty({ message: "Please enter account number." }),
    reminder_name: z.string().nonempty({ message: "Reminder name is required." }),
});

const TransferSchemaInterBank = z.object({
    toBank: z.string().nonempty({ message: "Please select a bank." }),
    transferTo: z.string().nonempty({ message: "Please select a beneficiary account." }),
    memorableName: z.string().nonempty({ message: "Memorable name is required." }),
});

const ManageBeneficiaryUI = () => {
    const [samebankOrInterbankTab, setSamebankOrInterbankTab] = useState("sameBank");
    const dispatch = useAppDispatch();
    const { isOpenDialog } = useAppSelector(state => state.task);
    const [selectedBeneficiarySameBank, setSelectedBeneficiarySameBank] = useState({ attribute1: '', attribute2: '' });
    const [searchQuery, setSearchQuery] = useState("");
    const [accountNumberInput, setAccountNumberInput] = useState('');
    const [selectedTransferToInterBank, setSelectedTransferToInterBank] = useState({ attribute1: '', attribute2: '' });
    const { error, accountInfo } = useAppSelector(state => state.account);
    const recipients = accountInfo.recipient_list?.[0]?.recipient_list || [];
    const [inBeneficiaries, setInBeneficiaries] = useState([]);

    useEffect(() => {
      const fetchRecipientsWithNames = async () => {
        if (!recipients || recipients.length === 0) return;
  
        const recipientsWithNames = await Promise.all(
            recipients.map(async (recipient) => {
            try {
              const data = await dispatch(fetchTransactionTarget(recipient.account_number)).unwrap();
              const bankName = recipient.bank_id === "6750a0c9a9dc441ad3fbfb9f" ? "Nhom10Bank" : recipient.bank_id;

              return {
                id: recipient.account_number,
                identity: {
                  name: data.name,
                  phone: "Not Available",
                  avt: "https://lh4.googleusercontent.com/proxy/-BvxvtLr9pzhfvVNx1CNxelUNQxeRwpfgobPfy46t5-c6_4kMIM_UUraqWpbcTNljDQQEUckfIVgZv00cDJMc3ZZdyOgrp5-PK5t8eDHCkNxupTIE4C7VIB4",
                },
                bank: bankName,
                account_number: recipient.account_number,
                reminder_name: recipient.reminder_name,
              };
            } catch (error) {
              console.error(`Error fetching name for account_number ${recipient.account_number}:`, error);
              return {
                id: recipient.account_number,
                identity: {
                  name: "Unknown",
                  phone: "Not Available",
                  avt: "https://randomuser.me/api/portraits/placeholder.jpg",
                },
                bank: recipient.bank_id === "6750a0c9a9dc441ad3fbfb9f" ? "Nhom10Bank" : "Unknown Bank",
                account_number: recipient.account_number,
                reminder_name: recipient.reminder_name,
              };
            }
          })
        );
  
        setInBeneficiaries(recipientsWithNames);
      };
  
      fetchRecipientsWithNames();
    }, [dispatch, recipients]);


    const banks = [
        { attribute1: "MT BANK" },
        { attribute1: "TP BANK" },
        { attribute1: "AB BANK" },
        { attribute1: "CD BANK" },
    ];

    const interBankAccounts = [
        { attribute1: "NGUYEN LAM HAI", attribute2: "123456", attribute3: "MT BANK" },
        { attribute1: "PHAN THAI KHANG", attribute2: "22222", attribute3: "KP BANK" },
        { attribute1: "NGUYEN PHU MINH BAO", attribute2: "233434", attribute3: "TP BANK" },
        { attribute1: "NGUYEN ANH KHOA", attribute2: "35667", attribute3: "MB BANK" },
    ];

    const saveBeneficiarySameBankForm = useForm({
        resolver: zodResolver(SaveBeneficiarySameBankSchema),
        defaultValues: {
            bank_id: "",
            account_number: "",
            reminder_name: "",
        },
    });

    const formInterBank = useForm({
        resolver: zodResolver(TransferSchemaInterBank),
        defaultValues: {
            transferFrom: "John Paul - 2222222222222222",
            toBank: "",
            transferTo: "",
            memorableName: "",
        },
    });

    function onSubmitInterBank(data: any) {
        console.log("Form Submitted:", data);
    }

    const setActiveTabAndCloseDropdowns = (tab: string) => {
        setSamebankOrInterbankTab(tab);
    };


    const [toBankValue, setToBankValue] = useState('');

    useEffect(() => {
        const subscription = formInterBank.watch((value) => {
            setToBankValue(value.toBank || '');
        });
        return () => subscription.unsubscribe();
    }, [formInterBank]);

    const handleTransferToInputChangeInterBank = (event) => {
        const inputAccountNumber = event.target.value.trim();
        setAccountNumberInput(inputAccountNumber);

        const toBankValue = formInterBank.watch('toBank');

        if (inputAccountNumber === "") {
            setSelectedTransferToInterBank({ attribute1: "", attribute2: "" });
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
            setSelectedTransferToInterBank({ attribute1: "", attribute2: inputAccountNumber });
            formInterBank.setError("transferTo", {
                type: "manual",
                message: "Account number is not valid or does not match the selected bank.",
            });
        }
    };

    const [inputValue, setInputValue] = useState<string>("");

    const handleInputChangeSameBank = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        saveBeneficiarySameBankForm.setValue("account_number", "");
        setSelectedBeneficiarySameBank({ attribute1: "", attribute2: "" });
        saveBeneficiarySameBankForm.clearErrors("account_number");
    };

    const handleFetchTargetDataSameBank = () => {
        if (!inputValue.trim()) {
            return;
        }

        const accountNumber = accountInfo.account_number;

        if (accountNumber && accountNumber === inputValue.trim()) {
            saveBeneficiarySameBankForm.setError("account_number", {
                type: "manual",
                message: "You cannot save yourself as your Beneficiary",
            });
            return;
        }

        dispatch(fetchTransactionTarget(inputValue.trim()))
            .unwrap()
            .then((data) => {
                if (accountNumber && accountNumber === data.account_number) {
                    saveBeneficiarySameBankForm.setError("account_number", {
                        type: "manual",
                        message: "You cannot save yourself as your Beneficiary",
                    });
                    return;
                }
                setSelectedBeneficiarySameBank({
                    attribute1: data.name,
                    attribute2: data.account_number,
                });
                saveBeneficiarySameBankForm.setValue("account_number", data.account_number);
                console.log("selected data number", selectedBeneficiarySameBank)
            })
            .catch((err) => {
                console.error("Error fetching target data:", err);
                saveBeneficiarySameBankForm.setError("account_number", {
                    type: "manual",
                    message: "No account number found",
                });
            });
    };


    function onSubmitSaveBeneficiarySameBank(data: { account_number: string; bank_id: string; reminder_name: string }) {
        dispatch(saveBeneficiary(data))
            .unwrap()
            .then((response: any) => {
                console.log("Beneficiary saved successfully:", response);
    
                toast.success("Beneficiary saved successfully!");
    
                dispatch(fetchRecipients())
                    .unwrap()
                    .then((recipients) => {
                        console.log("Updated recipient list:", recipients);
                        setInBeneficiaries(
                            recipients.map((recipient: any) => ({
                                id: recipient.account_number,
                                identity: {
                                    name: "Placeholder Name",
                                    phone: "Not Available",
                                    avt: "https://randomuser.me/api/portraits/placeholder.jpg",
                                },
                                bank: recipient.bank_id === "6750a0c9a9dc441ad3fbfb9f" ? "Nhom10Bank" : "Unknown Bank",
                                memorableName: recipient.reminder_name,
                            }))
                        );
                    })
                    .catch((err) => {
                        console.error("Error fetching updated recipients:", err);
                        toast.error("Failed to fetch updated recipients!");
                    });
            })
            .catch((error: any) => {
                console.error("Error saving beneficiary:", error);
                toast.error("Failed to save Beneficiary!");
            });
    }

    return (
        <div className="text-white font-sans flex">
            <div className="flex-1 rounded-3xl">
                {/* Tabs */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Manage Beneficiary</h1>
                    <p className="text-gray-400">To set up your beneficiary account!</p>
                </div>
                <div className="bg-black p-6 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4" style={{ boxShadow: "0px 4px 0px white" }}>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">Add Beneficiary</h1>
                        <p className="text-gray-400">To set up your beneficiary account</p>
                    </div>
                    <div className="flex space-x-4 mb-6 items-center">
                        <button
                            onClick={() => setActiveTabAndCloseDropdowns("sameBank")}
                            className={`flex-1 py-3 font-bold rounded-2xl ${samebankOrInterbankTab === "sameBank"
                                ? "bg-white text-black"
                                : "bg-black text-white border border-gray-600"
                                }`}
                        >
                            Same Bank
                        </button>
                        <button
                            onClick={() => setActiveTabAndCloseDropdowns("interBank")}
                            className={`flex-1 py-3 font-bold rounded-2xl ${samebankOrInterbankTab === "interBank"
                                ? "bg-white text-black"
                                : "bg-black text-white border border-gray-600"
                                }`}
                        >
                            InterBank
                        </button>
                    </div>

                    {samebankOrInterbankTab === "sameBank" ? (
                        <Form {...saveBeneficiarySameBankForm}>
                            <form onSubmit={saveBeneficiarySameBankForm.handleSubmit(onSubmitSaveBeneficiarySameBank)} className='w-full space-y-6 transition-all duration-1000 transform'>
                                {/* Transfer To */}
                                <FormField
                                    control={saveBeneficiarySameBankForm.control}
                                    name="account_number"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <label className="block text-white text-sm mb-2">Account Number</label>
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

                                                    <div className="w-1/2 relative">
                                                        <button
                                                            type="button"
                                                            className={`w-full form-select bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                                } focus:outline-none hover:border-white transition-all duration-200`}
                                                        >
                                                            {selectedBeneficiarySameBank.attribute1
                                                                ? `${selectedBeneficiarySameBank.attribute1} - ${selectedBeneficiarySameBank.attribute2}`
                                                                : "Account Name - Account Number"}
                                                        </button>

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
                                    control={saveBeneficiarySameBankForm.control}
                                    name="reminder_name"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <label className="block text-white text-sm mb-2">Memorable Name</label>
                                            <FormControl>
                                                <input
                                                    type="text"
                                                    placeholder="Enter memorable name"
                                                    value={field.value || ""}
                                                    className={`w-full form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                        } focus:outline-none`}
                                                    onChange={(e) => field.onChange(e.target.value)} // Cập nhật giá trị trong form
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

                                <Button
                                    type="submit"
                                    className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full"
                                >
                                    Save Beneficiary
                                </Button>
                            </form>
                        </Form>
                    )
                        : (
                            <Form {...formInterBank}>
                                <form onSubmit={formInterBank.handleSubmit(
                                    onSubmitInterBank,
                                    (errors) => {
                                        console.error("Validation errors:", errors);
                                    }
                                )} className="w-full space-y-6">
                                    <FormField
                                        control={formInterBank.control}
                                        name="toBank"
                                        render={({ field, fieldState }) => {
                                            return (
                                                <FormItem>
                                                    <label className="block text-white text-sm mb-2">Select Bank</label>
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
                                                <label className="block text-white text-sm mb-2">Select Account</label>
                                                <FormControl>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter account number"
                                                        value={selectedTransferToInterBank?.attribute2 || accountNumberInput} // Hiển thị attribute2 hoặc giá trị nhập
                                                        className={`w-full form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? 'border-red-500' : 'border-gray-800'
                                                            } focus:outline-none`}
                                                        onChange={(e) => {
                                                            setAccountNumberInput(e.target.value);
                                                            handleTransferToInputChangeInterBank(e);
                                                        }}
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
                                    <FormField
                                        control={formInterBank.control}
                                        name="memorableName"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <label className="block text-white text-sm mb-2">Memorable Name</label>
                                                <FormControl>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter memorable name"
                                                        value={field.value || ""}
                                                        className={`w-full form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                            } focus:outline-none`}
                                                        onChange={(e) => field.onChange(e.target.value)}
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


                                    <Button
                                        type="submit"
                                        className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full"
                                    >
                                        Save Beneficiary
                                    </Button>
                                </form>
                            </Form>
                        )
                    }
                </div>
                {/* Beneficiary table */}
                <div className="container mx-auto py-10">
                    <Dialog open={isOpenDialog} onOpenChange={(data) => {
                        console.log(data);
                        dispatch(interactDialog(data));
                    }}>
                        <DataTable columns={beneficiaryColumns} data={inBeneficiaries} />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Remove This Beneficiary</DialogTitle>
                                <DialogDescription>Are you sure you want to remove this beneficiary?</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button type="submit">Yes</Button>
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
        </div >
    );
};

export default ManageBeneficiaryUI;