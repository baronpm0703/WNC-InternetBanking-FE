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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const TransferSchema = z.object({
  transferTo: z.string().nonempty({ message: "Please select a beneficiary account." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid amount." }),
  purpose: z.string().nonempty({ message: "Purpose is required." }),
});


const DebtReminderUI = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { isOpenDialog } = useAppSelector(state => state.task);
  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
  const [activeStep, setActiveStep] = useState("transfer"); // New state for tracking steps
  const [formData, setFormData] = useState(null); // Dữ liệu từ form đầu tiên
  const [searchQuery, setSearchQuery] = useState("");

  const accounts = [
    { attribute1: "NGUYEN LAM HAI", attribute2: "123456" },
    { attribute1: "PHAN THAI KHANG", attribute2: "22222" },
    { attribute1: "NGUYEN PHU MINH BAO", attribute2: "233434" },
    { attribute1: "NGUYEN ANH KHOA", attribute2: "35667" },
  ];

  const form = useForm({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      transferFrom: "John Paul - 2222222222222222",
      transferTo: "",
      amount: "",
      purpose: "",
    },
  });

  function onSubmitSameBank(data: any) {
    console.log("Form Submitted:", data);
    setFormData(data);
    setActiveStep("otp");
  }

  function onSubmitSameBankOTP(data: any) {
    console.log("Form Submitted otp same bamk", data);
  }

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
            (activeStep === "transfer" ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSameBank)} className={`space-y-6 transition-all duration-1000 transform ${activeTab === "createReminder"
                  ? "opacity-100 translate-y-0 max-h-screen"
                  : "opacity-0 translate-y-[20px] max-h-0 overflow-hidden"
                  }`}>
                  <FormField
                    control={form.control}
                    name="transferTo"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <label className="block text-white text-sm mb-2">Remind To</label>
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
                <form onSubmit={form.handleSubmit(onSubmitSameBankOTP)} className="w-full space-y-6">
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveStep("transfer")}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-lg border border-gray-300"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    <h3 className="text-white text-lg text-center font-bold mb-4">Confirm Debt Remind Transaction</h3>

                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Transfer To:</p>
                      <p className="text-white font-bold">{formData?.transferTo}</p>
                    </div>

                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Amount:</p>
                      <p className="text-white font-bold">{formData?.amount} VND</p>
                    </div>

                    <div className="mb-4 flex justify-between">
                      <p className="text-gray-400">Purpose:</p>
                      <p className="text-white font-bold">{formData?.purpose}</p>
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

export default DebtReminderUI;