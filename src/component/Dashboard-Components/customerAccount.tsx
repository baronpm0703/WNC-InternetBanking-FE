import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { customerAccountColumns } from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog, openDialog } from "@/libs/slices/sliceTask";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AccountForm from "./accountForm";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { toast } from "react-toastify";
import { fetchCustomerAccount } from "@/libs/slices/sliceAccount";

interface ICommandProps {
  value: string; label: string
}
const commands: ICommandProps[] = [
  { value: "add", label: "Add a new" },
  { value: "delete", label: "Delete a customer" },
]

const CustomerAccountUI = () => {
  const dispatch = useAppDispatch();
  const { isOpenDialog } = useAppSelector(state => state.task);
  const { customerAccount, statusCreateCusAccount, createError } = useAppSelector(state => state.account);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };
  const filteredCommands = Array.isArray(commands)
    ? commands.filter((command) =>
      command.label.toLowerCase().includes(inputValue.toLowerCase())
    ): [];
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (statusCreateCusAccount === "Success") {
      toast.success("Create customer account successfully");
      dispatch(fetchCustomerAccount());
    } else if (statusCreateCusAccount === "Failed") {
      toast.error(createError);
    }
  }, [statusCreateCusAccount])
  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Tabs */}
        <div className="flex-1 flex flex-row justify-between">
          <div className="container ms-4 max-w-sm 2xl:max-w-3xl relative items-center">
            <Command className="rounded-lg border shadow-md w-full">
              <CommandInput placeholder="Type a command or search..." onValueChange={handleValueChange} ref={inputRef} onClick={() => { setOpen(prev => !prev) }} />
                <CommandList className="absolute rounded-lg top-14 w-full  z-20 bg-white">
                  {open &&
                    filteredCommands.length > 0 &&
                    filteredCommands.map((command) => (
                      <CommandItem key={command.value} value={command.value}>
                        {command.label}
                      </CommandItem>
                    ))
                  }
                </CommandList>
            </Command>
          </div>
          <Button 
            variant="secondary" 
            className="text-black bg-[#86E955] hover:opacity-40"
            onClick={() => {
              dispatch(openDialog());
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="text-black cursor-pointer" />
            New Account
          </Button>
        </div>
        {/* Customer table */}
        <div className="container-xl sm:container-sm mx-auto py-5">
          <DataTable columns={customerAccountColumns} data={converTypeHelper.convertToCustomerAccountColumns(customerAccount)} />
          {/* Dialog Create Account */}
          <Dialog open={isOpenDialog} onOpenChange={(data) => {
            console.log(data);
            dispatch(interactDialog(data));
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Customer Account</DialogTitle>
                <DialogDescription>Here's What's new with your account</DialogDescription>
              </DialogHeader>
              <div className="w-full"><hr /></div>
              <AccountForm/>
            </DialogContent>
          </Dialog>
          {/* Dialog Edit Account */}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountUI;