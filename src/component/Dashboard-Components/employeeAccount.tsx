import { useEffect, useMemo, useRef, useState } from "react";
import { employeeAccountColumns } from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDeleteEmployeeDialog, interactEmployeeCreateDialog, openEmployeeCreateDialog } from "@/libs/slices/sliceTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AccountForm from "./accountForm";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { toast } from "react-toastify";
import { AccountInfo, adminDeleteAccount, adminUpdateInfo, fetchEmployeeAccount, resetSelected } from "@/libs/slices/sliceAccount";
import { DataTable } from "../Resusable/dataTable";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import timeStampHelper from "@/helper/convertTimeStamp";
import { DialogClose } from "@radix-ui/react-dialog";


const EmployeeAccountUI = () => {
  const dispatch = useAppDispatch();
  const { isOpenEmployeeCreateDialog, isOpenDeleteEmployeeDialog } = useAppSelector(state => state.task);
  const { employeeAccount, statusAdminActions, createError, selectedEmployee } = useAppSelector(state => state.account);
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

  const handleDeleteConfirmation = () => {
    console.log("Delete confirmation: ", selectedEmployee);
    dispatch(adminDeleteAccount({username: selectedEmployee?.username || ""}));
  }

  useEffect(() => {
    if (statusAdminActions === "Success") {
      toast.success("Admin perform successfully");
      dispatch(fetchEmployeeAccount());
    } else if (statusAdminActions === "Failed") {
      toast.error(createError);
    }
    return () => {
      dispatch(resetSelected());
    }
  }, [statusAdminActions]);

  const filterByDate = useMemo(() => {
    return employeeAccount?.filter((item: AccountInfo) => {
      const { created_at } = item;
      let isValid = true;
      if (isValid && date?.from) {
        isValid = timeStampHelper.formatTimestamp(created_at || "") >= timeStampHelper.formatTimestamp(date.from.toISOString()) ? true : false;
      }
      if (isValid && date?.to) {
        isValid = timeStampHelper.formatTimestamp(created_at || "") <= timeStampHelper.formatTimestamp(date.to.toISOString()) ? true : false;
      }
      return isValid;
    });
  }, [date, employeeAccount]);
  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Customer table */}
        <div className="container-xl sm:container-sm mx-auto py-5">
          <Button
            variant="secondary"
            className="text-black bg-[#86E955] hover:opacity-40 mt-3 float-right clear-right"
            onClick={() => {
              dispatch(resetSelected());
              dispatch(openEmployeeCreateDialog());
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
          <DataTable columns={employeeAccountColumns} data={converTypeHelper.convertToEmployeeAccountColumns(filterByDate)} filterFields={[]} filterable={true} />
          {/* Dialog Create Account */}
          <Dialog open={isOpenEmployeeCreateDialog} onOpenChange={(data) => {
            console.log(data);
            dispatch(interactEmployeeCreateDialog(data));
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEmployee ? "Edit Employee Account" : "Create Employee Account"}</DialogTitle>
                <DialogDescription>Here's What's new with your account</DialogDescription>
              </DialogHeader>
              <div className="w-full"><hr /></div>
              <AccountForm selectedInfo={selectedEmployee} action={selectedEmployee ? adminUpdateInfo : undefined} role="Employee" dialogInteraction={interactEmployeeCreateDialog} />
            </DialogContent>
          </Dialog>
          {/* Dialog Delete Account */}
          <Dialog
            open={isOpenDeleteEmployeeDialog}
            onOpenChange={(data) => {
              dispatch(interactDeleteEmployeeDialog(data));
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
              </DialogHeader>
              <div className="w-full">
                <p className="text-center my-4">
                  Are you sure you want to delete this account? This action cannot be undone.
                </p>
                <hr />
              </div>
              <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="me-2">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" variant="destructive" onClick={handleDeleteConfirmation}>Confirm</Button>
              </DialogClose>
            </DialogFooter>
            </DialogContent>
            
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAccountUI;