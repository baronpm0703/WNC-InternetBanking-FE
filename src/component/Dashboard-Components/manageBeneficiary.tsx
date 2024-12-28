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

const TransferSchema = z.object({
    transferTo: z.string().nonempty({ message: "Please select a beneficiary account." }),
    memorableName: z.string().nonempty({ message: "Memorable name is required." }),
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
    const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
    const [searchQuery, setSearchQuery] = useState("");
    const [accountNumberInput, setAccountNumberInput] = useState('');
    const [selectedTransferToInterBank, setSelectedTransferToInterBank] = useState({ attribute1: '', attribute2: '' });

    const accounts = [
        { attribute1: "NGUYEN LAM HAI", attribute2: "123456" },
        { attribute1: "PHAN THAI KHANG", attribute2: "22222" },
        { attribute1: "NGUYEN PHU MINH BAO", attribute2: "233434" },
        { attribute1: "NGUYEN ANH KHOA", attribute2: "35667" },
    ];

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

    const form = useForm({
        resolver: zodResolver(TransferSchema),
        defaultValues: {
            transferFrom: "John Paul - 2222222222222222",
            transferTo: "",
            memorableName: "",
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

    function onSubmitSameBank(data: any) {
        console.log("Form Submitted:", data);
    }

    function onSubmitInterBank(data: any) {
        console.log("Form Submitted:", data);
    }

    const setActiveTabAndCloseDropdowns = (tab: string) => {
        setSamebankOrInterbankTab(tab);
    };


    const handleTransferToInputChange = (event) => {
        const inputValue = event.target.value.trim();

        if (inputValue === "") {
            setSelectedTransferTo({ attribute1: "", attribute2: "" });
            form.setValue("transferTo", "");
            return;
        }

        const matchedItem = accounts.find(
            (item) => item.attribute2 === inputValue
        );

        if (matchedItem) {
            setSelectedTransferTo(matchedItem);
            form.setValue(
                "transferTo",
                `${matchedItem.attribute1} - ${matchedItem.attribute2}`
            );
        } else {
            setSelectedTransferTo({ attribute1: "", attribute2: inputValue });
            form.setError("transferTo", {
                type: "manual",
                message: "Account number is not valid.",
            });
        }
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitSameBank)} className='w-full space-y-6 transition-all duration-1000 transform'>
                                {/* Transfer To */}
                                <FormField
                                    control={form.control}
                                    name="transferTo"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <label className="block text-white text-sm mb-2">Account Number</label>
                                            <FormControl>
                                                <div className="flex justify-between items-center space-x-3">
                                                    {/* Input Field */}
                                                    <input
                                                        type="text"
                                                        placeholder="Enter account number"
                                                        value={selectedTransferTo.attribute2}
                                                        className={`w-1/2 form-input bg-gray-900 text-white rounded-xl px-4 py-2 border ${fieldState.error ? "border-red-500" : "border-gray-800"
                                                            } focus:outline-none`}
                                                        onChange={handleTransferToInputChange}
                                                    />

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
                                                                        : "Select an Account"}
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
                                                                            : 'Select an Account'}
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