"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import timeStampHelper from "@/helper/convertTimeStamp";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { selectCustomerById, selectEmployeeById } from "@/libs/slices/sliceAccount";
import { selectDebt } from "@/libs/slices/sliceDebt";
import { openDeleteEmployeeDialog, openDetailDialog, openDialog, openEmployeeCreateDialog, openRepayModal, openCancelDebtModal } from "@/libs/slices/sliceTask";
import { BankInfo, selectTransaction } from "@/libs/slices/sliceTransaction";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export enum AccountRole {
  Customer = "Customer",
  Employee = "Employee",
  Admin = "Admin"
}

export type Identity = {
  name: string,
  phone: string,
  avt: string
}

export type Transaction = {
  identity: Identity,
  status: "Received" | "Transfered"
  id: string
  bankName?: string
  transactionID: string
  bankInfo: string | BankInfo
  bank_sender_id: string | BankInfo
  bank_recipient_id: string | BankInfo
  sender_info: {
    account_number: string
    name: string
  }
  recipient_info: {
    account_number: string
    name: string
  }
  payment_method: "Sender Pay" | "Recipient Pay"
  amount: number
  transaction_date: string
  isInterBank_transaction: boolean
  remarks: string
}

export type customerAccount = {
  id: string,
  identity: Identity,
  date: string,
  email: string,
  phone: string,
  accountNumber: string,
  accountBalance: number
}

export type employeeAccount = {
  id: string,
  identity: Identity,
  date: string,
  email: string,
  phone: string,
  role: AccountRole
}

export type Beneficiary = {
  id: string,
  identity: Identity,
  bank: string,
  memorableName: string,
}

export const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "7d8e1d42",
    amount: 125,
    status: "success",
    email: "example@gmail.com",
  },
  {
    id: "7d8e1d43",
    amount: 125,
    status: "failed",
    email: "exple@gmail.com"
  }
]

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select this row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "id",
    header: "Payment ID",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original; // Access Data's row
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white p-2 rounded-xl z-10 text-black">
            <DropdownMenuLabel className="mb-2">Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy Payment Id
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export type Debt = {
  id: string
  identity: Identity,
  status: "Pending" | "Success" | "Canceled"
  bank_id: string
  debtID: string
  debtor_name: string
  debtee_name: string
  debtor_number: string
  debtee_number: string
  amount: number
  debtRemind_date: string
  detail: string
}

export const inDebts: Debt[] = [
  {
    id: "728ed52f",
    identity: {
      name: "Nguyen Van A",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/75.jpg"
    },
    debtee_name: "phan thai khang",
    debtor_name: "nguyen phu minh bao",
    amount: 100.3,
    bank_id: "123456789",
    debtor_number: "123",
    debtee_number: "234",
    debtRemind_date: "Apr 20, 9:30 AM",
    detail: "Transfer",
    debtID: "xaa12",
    status: "Pending"
  }
]

export const debteeColumns: ColumnDef<Debt>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select this row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "identity",
    header: () => <p className="text-left text-[#E0FFBC]">Account</p>,
    cell: ({ row }) => {
      const identity = row.original.identity;
      const accountNumber = row.original.debtee_number || "Unknown";
      const debteeName = row.original.debtee_name || "Unknown";
      const accountInfo = useAppSelector((state) => state.account.accountInfo);

      const displayAccount = accountNumber === accountInfo.account_number
        ? row.original.debtor_number
        : accountNumber;

      const displayName = accountNumber === accountInfo.account_number
        ? row.original.debtor_name
        : debteeName;

      return (
        <div className="flex items-center">
          <img src={identity.avt} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="ml-2">
            <p className="text-left font-medium">{displayName}</p>
            <p className="text-left font-sm">{displayAccount}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "debtRemind_date",
    header: () => <p className="text-left text-[#E0FFBC]">Date</p>,
  },
  {
    accessorKey: "amount",
    header: () => <p className="text-left text-[#E0FFBC]">Amount</p>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-left font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "detail",
    header: () => <p className="text-left text-[#E0FFBC]">Detail</p>,
  },
  {
    accessorKey: "status",
    header: () => <p className="text-left text-[#E0FFBC]">Status</p>,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className={
          `text-center text-black px-4 py-1 rounded-md font-medium ${status === "Pending" ? " bg-[#F6E05E]" : status === "Success" ? "bg-[#68D391]" : "bg-[#F56565]"}
        `}>
          <p>{status}</p>
        </div>

      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const debt = row.original;
      const accountInfo = useAppSelector(state => state.account.accountInfo);
      const isRepayDisabled = debt.debtee_number === accountInfo.account_number || debt.status !== "Pending"; // Kiểm tra thêm status
      const isCancelDisabled = debt.status !== "Pending"; // Kiểm tra status cho "Cancel"

      const handleRepay = () => {
        console.log("Repay debt", debt);
        dispatch(openRepayModal());
        dispatch(selectDebt(debt));
      };

      const handleCancel = () => {
        dispatch(openCancelDebtModal()); // Mở modal Cancel
        dispatch(selectDebt(debt));
      };

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white p-2 rounded-xl z-10 text-black">
            {/* Chỉ hiển thị mục Repay Debt nếu không trùng account_number */}
            {!isRepayDisabled && (
              <>
                <DropdownMenuItem onClick={handleRepay}>Repay Debt</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {!isCancelDisabled && (
              <DropdownMenuItem onClick={handleCancel} onSelect={(e) => e.preventDefault()}>
                Cancel
              </DropdownMenuItem>
            )}          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
]

export const transactionHistory: Transaction[] = [
  {
    id: "728ed52f",
    identity: {
      name: "Nguyen Van A",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/75.jpg"
    },
    bank_recipient_id: "123456789",
    bank_sender_id: "123456789",
    sender_info: {
      account_number: "123456789",
      name: "Nguyen Van A"
    },
    bankInfo: "IBP",
    recipient_info: {
      account_number: "123456789",
      name: "Nguyen Van B"
    },
    payment_method: "Sender Pay",
    isInterBank_transaction: false,
    remarks: "Transfer",
    transaction_date: "Apr 20, 9:30 AM",
    transactionID: "xaa12",
    amount: 100.3,
    status: "Received"
  }
]

export const beneficiaryColumns: ColumnDef<Beneficiary>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select this row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "identity",
    header: () => <p className="text-left text-[#E0FFBC]">Name</p>,
    cell: ({ row }) => {
      const identity = row.original.identity;
      return (
        <div className="flex items-center">
          <img src={identity.avt} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="ml-2">
            <p className="text-left font-medium">{identity.name}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "bank",
    header: () => <p className="text-left text-[#E0FFBC]">Bank</p>,
  },
  {
    accessorKey: "account_number",
    header: () => <p className="text-left text-[#E0FFBC]">Account Number</p>,
  },
  {
    accessorKey: "reminder_name",
    header: () => <p className="text-left text-[#E0FFBC]">Memorable Name</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const beneficiary = row.original; // Access Data's row
      const handleEdit = () => {
        console.log("Edit beneficiary", beneficiary.id);
      }
      const handleRemove = () => {
        console.log("Remove beneficiary", beneficiary.id);
        dispatch(openDialog());
      }
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button >
          </DropdownMenuTrigger >
          <DropdownMenuContent align="end" className="bg-white p-2 rounded-xl z-10 text-black">
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRemove} onSelect={(e) => e.preventDefault()}>Remove</DropdownMenuItem>
          </DropdownMenuContent >
        </DropdownMenu >

      )
    }
  }
]

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select this row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "identity",
    header: () => <p className="text-left text-[#E0FFBC]">Name</p>,
    cell: ({ row }) => {
      const identity = row.original.identity;
      return (
        <div className="flex items-center">
          <img src={identity.avt} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="ml-2">
            <p className="text-left font-medium">{identity.name}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "date",
    header: () => <p className="text-left text-[#E0FFBC]">Transaction Date</p>,
    cell: ({ row }) => {
      const date = row.original.transaction_date;
      return <div className="text-left font-medium">{date}</div>
    }
  },
  {
    accessorKey: "bankInfo",
    header: () => <p className="text-left text-[#E0FFBC]">Bank</p>,
    cell: ({ row }) => {
      const bankInfo: string | BankInfo = row.original.bankInfo;
      if (typeof bankInfo != "string") {
        return <div className="text-left font-medium">{(bankInfo as BankInfo).name}</div>
      } else return <div className="text-left font-medium">{bankInfo}</div>
    }
  },
  {
    accessorKey: "bankName"
  },
  {
    accessorKey: "payment_method",
    header: () => <p className="text-left text-[#E0FFBC]">Payment Method</p>,
  },
  {
    accessorKey: "amount",
    header: () => <p className="text-left text-[#E0FFBC]">Amount</p>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-left font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "status",
    header: () => <p className="text-left text-[#E0FFBC]">Status</p>,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className={`
          text-center w-full px-1 text-black py-1 rounded-md font-medium ${status === "Received" ? "bg-[#02b1598d] text-[#d2f8a7]" : status === "Transfered" ? "bg-[#E0FFBC] text-[#02b1598d]" : "bg-[#F56565]"}
        `}
        >
          <p>{status}</p>

        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const transaction = row.original; // Access Data's row
      const handleDetail = () => {
        console.log("Click detail", transaction);
        dispatch(openDetailDialog());
        dispatch(selectTransaction(transaction));
      }
      return (
        <div className="flex justify-center">
          <Button variant="ghost" className=" px-5 border rounded-3xl" onClick={handleDetail}>
            Detail
          </Button>
        </div>

      )
    }
  }
]

export const customerAccountColumns: ColumnDef<customerAccount>[] = [
  {
    accessorKey: "identity",
    header: ({ column }) =>
      <div
        className="text-left text-[#E0FFBC] flex flex-row items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>,
    cell: ({ row }) => {
      const identity = row.original.identity;
      return (
        <div className="flex items-center">
          <img src={identity.avt} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="ml-2">
            <p className="text-left font-medium">{identity.name}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: ({ }) =>
      <div
        className="text-left text-[#E0FFBC] ">
        Email
      </div>,
  },
  {
    accessorKey: "phone",
    header: () => <p className="text-left text-[#E0FFBC]">Phone</p>,
  },
  {
    accessorKey: "accountNumber",
    header: () => <p className="text-left text-[#E0FFBC]">Account Number</p>
  },
  {
    accessorKey: "date",
    header: ({ column }) =>
      <div
        className="text-left text-[#E0FFBC] flex flex-row items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>,
    cell: ({ row }) => {
      const date = row.original.date;
      return <div className="text-left font-medium">{timeStampHelper.formatTimestamp(date)}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const debt = row.original; // Access Data's row
      const navigate = useNavigate();
      const handleDeposit = () => {
        console.log("Deposit debt", debt);
        dispatch(selectCustomerById(parseInt(debt.id)));
        navigate("/dashboard/deposit-money")
      }
      const handleViewTransaction = () => {
        dispatch(selectCustomerById(parseInt(debt.id)));
        navigate("/dashboard/customer-transactions-history")
      }
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Action</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black p-2 rounded-xl z-10">
            <DropdownMenuItem onClick={handleDeposit} onSelect={(e) => e.preventDefault()}>Deposit Money</DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewTransaction} onSelect={(e) => e.preventDefault()}>View Transaction History</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      )
    }
  }
]

export const employeeAccountColumns: ColumnDef<employeeAccount>[] = [
  {
    accessorKey: "identity",
    header: ({ column }) =>
      <div
        className="text-left text-[#E0FFBC] flex flex-row items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>,
    cell: ({ row }) => {
      const identity = row.original.identity;
      return (
        <div className="flex items-center">
          <img src={identity.avt} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="ml-2">
            <p className="text-left font-medium">{identity.name}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: ({ }) =>
      <div
        className="text-left text-[#E0FFBC] ">
        Email
      </div>,
  },
  {
    accessorKey: "phone",
    header: () => <p className="text-left text-[#E0FFBC]">Phone</p>,
  },
  {
    accessorKey: "role",
    header: () => <p className="text-left text-[#E0FFBC]">Role</p>,
  },
  {
    accessorKey: "date",
    header: ({ column }) =>
      <div
        className="text-left text-[#E0FFBC] flex flex-row items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>,
    cell: ({ row }) => {
      const date = row.original.date;
      return <div className="text-left font-medium">{timeStampHelper.formatTimestamp(date)}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const account = row.original; // Access Data's row
      const navigate = useNavigate();
      const handleEditEmployee = () => {
        console.log("Edit Employee", account);
        dispatch(openEmployeeCreateDialog());
        dispatch(selectEmployeeById(parseInt(account.id)));
      }
      const handleDeleteAccount = () => {
        console.log("Delete Employee", account);
        dispatch(openDeleteEmployeeDialog());
        dispatch(selectEmployeeById(parseInt(account.id)));
      }
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Action</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black p-2 rounded-xl z-10">
            <DropdownMenuItem onClick={handleEditEmployee} onSelect={(e) => e.preventDefault()}>Edit Account</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteAccount} onSelect={(e) => e.preventDefault()}>Delete Account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export const debtorColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className=" border-gray-300 bg-gray-100 text-indigo-600 ring-2 ring-offset-2 ring-indigo-500 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out hover:border-indigo-600 hover:ring-indigo-600"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select this row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "identity",
    header: () => <p className="text-left text-[#E0FFBC]">Name</p>,
    cell: ({ row }) => {
      const identity = row.original.identity;
      return (
        <div className="flex items-center">
          <img src={identity.avt} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="ml-2">
            <p className="text-left font-medium">{identity.name}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "date",
    header: () => <p className="text-left text-[#E0FFBC]">Transaction Date</p>,
    cell: ({ row }) => {
      const date = row.original.transaction_date;
      return <div className="text-left font-medium">{date}</div>
    }
  },
  {
    accessorKey: "bankInfo",
    header: () => <p className="text-left text-[#E0FFBC]">Bank</p>,
    cell: ({ row }) => {
      const bankInfo: string | BankInfo = row.original.bankInfo;
      if (typeof bankInfo != "string") {
        return <div className="text-left font-medium">{(bankInfo as BankInfo).name}</div>
      } else return <div className="text-left font-medium">{bankInfo}</div>
    }
  },
  {
    accessorKey: "bankName"
  },
  {
    accessorKey: "payment_method",
    header: () => <p className="text-left text-[#E0FFBC]">Payment Method</p>,
  },
  {
    accessorKey: "amount",
    header: () => <p className="text-left text-[#E0FFBC]">Amount</p>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-left font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "status",
    header: () => <p className="text-left text-[#E0FFBC]">Status</p>,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className={`
          text-center w-full px-1 text-black py-1 rounded-md font-medium ${status === "Received" ? "bg-[#02b1598d] text-[#d2f8a7]" : status === "Transfered" ? "bg-[#E0FFBC] text-[#02b1598d]" : "bg-[#F56565]"}
        `}
        >
          <p>{status}</p>

        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const transaction = row.original; // Access Data's row
      const handleDetail = () => {
        console.log("Click detail", transaction);
        dispatch(openDetailDialog());
        dispatch(selectTransaction(transaction));
      }
      return (
        <div className="flex justify-center">
          <Button variant="ghost" className=" px-5 border rounded-3xl" onClick={handleDetail}>
            Detail
          </Button>
        </div>

      )
    }
  }
]