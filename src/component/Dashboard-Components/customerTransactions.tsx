import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { transactionColumns } from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog } from "@/libs/slices/sliceTask";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AccountInfo, selectCustomer } from "@/libs/slices/sliceAccount";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { fetchAccountTransaction } from "@/libs/slices/sliceTransaction";

const CustomerTransactionUI = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isOpenDialog } = useAppSelector(state => state.task);
  const { customerAccount, selectedCustomer } = useAppSelector(state => state.account);
  const { transactions, loading } = useAppSelector(state => state.transaction);
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
                    style={{boxShadow: "-1px 4px 0px rgb(255, 255, 255)"}}>
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
            open={isOpenDialog}
            onOpenChange={(data) => {
              console.log(data);
              dispatch(interactDialog(data));
            }}
          >
            <DataTable columns={transactionColumns} data={converTypeHelper.convertToCustomerTransacrionColumns(transactions, selectedCustomer?.account_number)} loading={loading}/>
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
    </div>
  );
};


export default CustomerTransactionUI;