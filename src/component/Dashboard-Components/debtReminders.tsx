import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import ItemDropdown from './dropdown';
import DemoPage from "../Resusable/page";
import { DataTable } from "../Resusable/dataTable";
import { debtColumns, inDebts} from "../Resusable/columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { interactDialog } from "@/libs/slices/sliceTask";

const DebtReminderUI = () => {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Debt Reminder</h1>
          <p className="text-gray-400">Your Money, Your Control!</p>
        </div>
        <div className="bg-black p-6 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4" style={{ boxShadow: "0px 4px 0px white" }}>
          {/* Form Logic */}
          <form className={`transition-all duration-1000 transform ${activeTab === "createReminder"
            ? "opacity-100 translate-y-0 max-h-screen"
            : "opacity-0 translate-y-[20px] max-h-0 overflow-hidden"
            }`}>
            {/* Reminder To */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="w-full h-5 flex justify-between items-center" id="closeButton">
                Information
                <FontAwesomeIcon
                  icon={faX}
                  onClick={() => setActiveTab(null)}
                  className="text-white-500 hover:text-white-700 cursor-pointer"
                />
              </div>
              <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200">
                <label className="block text-white text-xs mb-1">Remind to</label>
                <div className="flex justify-between items-center">
                  {selectedTransferTo.attribute1 === '' ? (
                    <input
                      type="text"
                      placeholder="Enter Account Number"
                      className="bg-transparent w-full text-white font-bold focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center">
                      <span className="text-white font-bold">{selectedTransferTo.attribute1}</span>
                      <span className="text-gray-500 ml-2">- {selectedTransferTo.attribute2}</span>
                      <FontAwesomeIcon
                        icon={faTrash}
                        onClick={
                          () => {
                            setSelectedTransferTo({ attribute1: '', attribute2: '' })
                          }
                        }
                        className="ml-2 text-white-500 hover:text-white-700 cursor-pointer"
                      />
                    </div>
                  )}
                  
                </div>
                {isDropdownOpenTransferTo && (
                  <ItemDropdown
                    title="Select Beneficiary Account"
                    items={[
                      { attribute1: 'John Paul', attribute2: '2222222222222222' },
                      { attribute1: 'Kenijen', attribute2: '1234567890122937' },
                      { attribute1: 'Kendrick', attribute2: '4444444444444444' },
                    ]}
                    selectedItem={selectedTransferTo}
                    setSelectedItem={setSelectedTransferTo}
                    isDropdownOpen={isDropdownOpenTransferTo}
                    setIsDropdownOpen={setIsDropdownOpenTransferTo}
                  />
                )}
              </div>
            </div>

            {/* Amount and Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <label className="block text-gray-400 text-sm mb-1">Amount</label>
                <div className="flex items-center bg-gray-900 rounded-2xl border border-gray-800 border border-gray-800 hover:border-white transition-all duration-200">
                  <input
                    type="text"
                    placeholder="100.000"
                    className="w-full py-6 px-4 bg-transparent text-white focus:outline-none"
                  />
                  <span className="px-4 text-gray-400">VND</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-400 text-sm mb-1">Reminder Content</label>
                <input
                  type="text"
                  placeholder="Tien an sang hom nay"
                  className="w-full py-6 px-4 bg-gray-900 text-white rounded-2xl border border-gray-800 focus:outline-none border border-gray-800 hover:border-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full">
              Create
            </button>
          </form>

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