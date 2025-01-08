import { useEffect, useMemo, useRef, useState } from "react";
import { transactionColumns } from "../Resusable/columns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDetailDialog } from "@/libs/slices/sliceTask";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AccountInfo, selectCustomer } from "@/libs/slices/sliceAccount";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { fetchSpecialTransaction, TransactionRecord } from "@/libs/slices/sliceTransaction";
import timeStampHelper from "@/helper/convertTimeStamp";
import currencyHelper from "@/helper/currencyHelper";
import { DataTable } from "../Resusable/dataTable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

const EmployeeTransactionUI = () => {
  const dispatch = useAppDispatch();
  const { isOpenDetailDialog } = useAppSelector(state => state.task);
  const { customerAccount, selectedCustomer } = useAppSelector(state => state.account);
  const { transactions, loading, selectedTransaction } = useAppSelector(state => state.transaction);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

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
    console.log("Fetching Admin Transaction History");
    dispatch(fetchSpecialTransaction());
  }, []);

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

  console.log("Filter by date", filterByDate);
  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Header */}
        <div className="text-white font-sans flex">
          <div className="flex-1 rounded-3xl">
            {/* Filter */}
            <div className="mx-auto container">
              <h1 className="text-4xl font-bold">External Transaction History</h1>
            </div>
          </div>
        </div>
        {/* Transactions table */}
        <div className="container mx-auto py-2">
          {/* Date Picker */}
          <div className={` gap-2 text-black float-right mt-3 me-3`}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg border-none justify-start text-left font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DataTable
            columns={transactionColumns}
            data={converTypeHelper.convertToAdminransacrionColumns(filterByDate)}
            loading={loading}
            filterable={true}
            filterFields={["bankName"]}
            calculateKeyWord="amount"
          />
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
                    <p className="text-gray-800 font-semibold">{
                      typeof selectedTransaction?.bankInfo === 'string' ? selectedTransaction?.bankInfo : selectedTransaction?.bankInfo?.name
                    }</p>
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

export default EmployeeTransactionUI;