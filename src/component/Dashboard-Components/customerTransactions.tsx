import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import ItemDropdown from './dropdown';
import DemoPage from "../Resusable/page";
import { DataTable } from "../Resusable/dataTable";
import { debtColumns, inDebts, transactionColumns, transactionHistory} from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog } from "@/libs/slices/sliceTask";

const CustomerTransactionUI = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isOpenDialog } = useAppSelector(state => state.task);
  const [isDropdownOpenTransferTo, setIsDropdownOpenTransferTo] = useState(false);
  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });

  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Tabs */}
        <div className="mb-2 mx-auto container">
          <h1 className="text-2xl font-bold">Customer Transaction History</h1>
        </div>
        {/* Debt table */}
        <div className="container mx-auto py-3">
          <Dialog open={isOpenDialog} onOpenChange={(data) => {
            console.log(data);
            dispatch(interactDialog(data));
          }}>
            <DataTable columns={transactionColumns} data={transactionHistory} />
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