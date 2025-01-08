import { useEffect, useMemo, useRef, useState } from "react";
import { customerAccountColumns } from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog, openDialog } from "@/libs/slices/sliceTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AccountForm from "./accountForm";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { toast } from "react-toastify";
import { AccountInfo, fetchCustomerAccount } from "@/libs/slices/sliceAccount";
import { DataTable } from "../Resusable/dataTable";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import timeStampHelper from "@/helper/convertTimeStamp";

const CustomerAccountUI = () => {
  const dispatch = useAppDispatch();
  const { isOpenDialog } = useAppSelector(state => state.task);
  const { customerAccount, statusCreateCusAccount, createError } = useAppSelector(state => state.account);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
  }, [statusCreateCusAccount]);

  const filterByDate = useMemo(() => {
    return customerAccount?.filter((item: AccountInfo) => {
      const { created_at } = item;
      let isValid = true;
      if (date?.from) {
        isValid = timeStampHelper.formatTimestamp(created_at || "") >= timeStampHelper.formatTimestamp(date.from.toISOString()) ? true : false;
      }
      if (date?.to) {
        isValid = timeStampHelper.formatTimestamp(created_at || "") <= timeStampHelper.formatTimestamp(date.to.toISOString()) ? true : false;
      }
      return isValid;
    });
  }, [date, customerAccount]);
  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Customer table */}
        <div className="container-xl sm:container-sm mx-auto py-5">
          <Button
            variant="secondary"
            className="text-black bg-[#86E955] hover:opacity-40 mt-3 float-right clear-right" 
            onClick={() => {
              dispatch(openDialog());
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="text-black cursor-pointer" />
            New Account
          </Button>
          <div className={`grid gap-2 text-black mt-3 me-3 float-right`}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
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
          <DataTable columns={customerAccountColumns} data={converTypeHelper.convertToCustomerAccountColumns(filterByDate)} filterFields={["accountNumber"]} filterable={true} />
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
              <AccountForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountUI;