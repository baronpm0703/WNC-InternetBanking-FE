"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAppDispatch} from "@/libs/hooks";
import { openDialog } from "@/libs/slices/sliceTask";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react";

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export type Identity = {
  name: string,
  phone: string,
  avt: string
}

export type Debt = {
  id: string,
  identity: Identity,
  date: string,
  debtReminder_id: string,
  amount: number,
  status: "Pending" | "Paid" | "Decline"
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
          <DropdownMenuContent align="end" className="bg-black p-2 rounded-xl z-10">
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

export const inDebts: Debt[] = [
  {
    id: "728ed52f",
    identity: {
      name: "Nguyen Van A",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/75.jpg"
    },
    date: "Apr 20, 9:30 AM",
    debtReminder_id: "xaa12",
    amount: 100.3,
    status: "Pending"
  },
  {
    id: "489e1d42",
    identity: {
      name: "Nguyen Van B",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/76.jpg"
    },
    date: "Apr 20, 9:30 AM",
    debtReminder_id: "xaa12",
    amount: 125.5,
    status: "Paid"
  },
  {
    id: "7d8e1d42",
    identity: {
      name: "Nguyen Van C",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/74.jpg"
    },
    date: "Apr 20, 9:30 AM",
    debtReminder_id: "xaa12",
    amount: 125.5,
    status: "Decline"
  }
]

export const debtColumns: ColumnDef<Debt>[] = [
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
            <p className="text-left text-[#A0AEC0]">{identity.phone}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "date",
    header: () => <p className="text-left text-[#E0FFBC]">Date</p>,
  },
  {
    accessorKey: "debtReminder_id",
    header: () => <p className="text-left text-[#E0FFBC]">Reminder ID</p>,
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
        <div className={
          `text-center text-black px-4 py-1 rounded-md font-medium ${status === "Pending" ? " bg-[#F6E05E]" : status === "Paid" ? "bg-[#68D391]" : "bg-[#F56565]"}
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
      const debt = row.original; // Access Data's row
      const handleRepay = () => {
        console.log("Repay debt", debt.id);
      }
      const handleCancel = () => {
        console.log("Cancel debt", debt.id);
        dispatch(openDialog());
      }
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black p-2 rounded-xl z-10">
            <DropdownMenuItem onClick={handleRepay}>Repay Debt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCancel} onSelect={(e) => e.preventDefault()}>Cancel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      )
    }
  }
]

export const inBeneficiaries: Beneficiary[] = [
  {
    id: "728ed52f",
    identity: {
      name: "Nguyen Van A",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/75.jpg"
    },
    bank: "BC BANK",
    memorableName: "ANHA"
  },
  {
    id: "489e1d42",
    identity: {
      name: "Nguyen Van B",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/76.jpg"
    },
    bank: "AB BANK",
    memorableName: "ANH B"
  },
  {
    id: "7d8e1d42",
    identity: {
      name: "Nguyen Van C",
      phone: "0123456789",
      avt: "https://randomuser.me/api/portraits/med/men/74.jpg"
    },
    bank: "TP BANK",
    memorableName: "ANH C"
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
            <p className="text-left text-[#A0AEC0]">{identity.phone}</p>
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
    accessorKey: "memorableName",
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black p-2 rounded-xl z-10">
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRemove} onSelect={(e) => e.preventDefault()}>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      )
    }
  }
]