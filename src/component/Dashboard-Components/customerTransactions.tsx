import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { transactionColumns } from "../Resusable/columns";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDetailDialog, interactDialog } from "@/libs/slices/sliceTask";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AccountInfo, selectCustomer } from "@/libs/slices/sliceAccount";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { fetchAccountTransaction } from "@/libs/slices/sliceTransaction";
import timeStampHelper from "@/helper/convertTimeStamp";
import currencyHelper from "@/helper/currencyHelper";

const CustomerTransactionUI = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isOpenDetailDialog } = useAppSelector(state => state.task);
  const { customerAccount, selectedCustomer } = useAppSelector(state => state.account);
  const { transactions, loading, selectedTransaction } = useAppSelector(state => state.transaction);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  // Filter accounts based on input value (search by name or account number)
  const filteredAccounts = Array.isArray(customerAccount)
    ? customerAccount.filter((account: AccountInfo) =>
      account.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      account.account_number.toLowerCase().includes(inputValue.toLowerCase())
    )
    : [];

  // Handle CommandItem selection
  const handleCommandItemClick = (account: AccountInfo) => {
    const value = `${account.name} - ${account.account_number}`;
    console.log("Selected account:", value); // Debugging
    dispatch(selectCustomer(account)); // Update selectedCustomer in Redux store
    setOpen(false); // Close CommandList
  };

  // Handle clicking outside the input field to close the CommandList
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) && !inputRef.current.closest(".CommandList")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (selectedCustomer) {
      console.log("Fetching Transaction History");
      dispatch(fetchAccountTransaction(selectedCustomer.account_number));
    }
  }, [selectedCustomer])
  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Tabs */}
        <div className="text-white font-sans flex">
          <div className="flex-1 rounded-3xl">
            {/* Tabs */}
            <div className="mb-2 mx-auto container">
              <h1 className="text-2xl font-bold mb-3">Customer Transaction History</h1>
              <div className="container max-w-sm 2xl:max-w-xl relative items-center">
                <Command className="rounded-lg border shadow-md w-full flex flex-row">
                  {/* Input field */}
                  <CommandInput
                    className="CommandInput"
                    placeholder="Type Account Name To Search..."
                    onValueChange={setInputValue}
                    onClick={() => {
                      setOpen(true);
                    }} // Toggle CommandList
                  />

                  <div
                    className="absolute left-[calc(110%)] rounded-full bg-[#91DC6C] py-3 px-4 min-w-[60%]"
                    style={{ boxShadow: "-1px 4px 0px rgb(255, 255, 255)" }}>
                    {selectedCustomer && `${selectedCustomer.name} - ${selectedCustomer.account_number}` || "Select A Customer Account"}
                  </div>

                  {/* CommandList */}
                  <CommandList className="absolute rounded-lg top-[calc(110%)] w-full z-20 bg-white" ref={inputRef}>
                    {open &&
                      filteredAccounts.length > 0 &&
                      filteredAccounts.map((account: AccountInfo, index) => (
                        <CommandItem
                          key={index}
                          value={account.name}
                          onSelect={() => handleCommandItemClick(account)}
                        >
                          {account.name} - {account.account_number}
                        </CommandItem>
                      ))}
                  </CommandList>
                </Command>
              </div>
            </div>
          </div>
        </div>
        {/* Debt table */}
        <div className="container mx-auto py-3">
          <Dialog
            open={isOpenDetailDialog}
            onOpenChange={(data) => {
              console.log(data);
              dispatch(interactDetailDialog(data));
            }}
          >
            <DialogTitle>Transaction Detail</DialogTitle>
            <DataTable columns={transactionColumns} data={converTypeHelper.convertToCustomerTransacrionColumns(transactions, selectedCustomer?.account_number)} loading={loading} />
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
  );
};


export default CustomerTransactionUI;