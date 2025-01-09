import { Dialog, DialogFooter, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import timeStampHelper from "@/helper/convertTimeStamp";
import currencyHelper from "@/helper/currencyHelper";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { beneficiaryColumns, transactionColumns } from "../Resusable/columns";
import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../Resusable/dataTable";
import { interactDetailDialog, interactDialog } from "@/libs/slices/sliceTask";
import converTypeHelper from "@/helpers/convertTypeHelper";
import { Button } from "@/components/ui/button";
import { fetchTransactionTarget } from "@/libs/slices/sliceAccount";
import { fetchBankById } from "@/libs/slices/sliceExternalBank";
import { fetchExternalAccount } from "@/libs/slices/sliceExternalBank";
import { fetchAccountTransaction } from "@/libs/slices/sliceTransaction";

const DashboardUI = memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accountInfo } = useAppSelector(state => state.account);
  useEffect(() => {
    console.log("Before Move Account Info: ", accountInfo);
    if (accountInfo.role !== "Customer") {
      navigate(`/${accountInfo.role}`);
    }
  }, [accountInfo.role]);
  const { isOpenDetailDialog } = useAppSelector(state => state.task);

  const recipients = accountInfo.recipient_list?.[0]?.recipient_list || [];
  const { transactions, loading, selectedTransaction } = useAppSelector(state => state.transaction);
  const { isOpenDialog } = useAppSelector(state => state.task);

  useEffect(() => {
    if (accountInfo.account_number) {
      console.log("Fetching Transaction History");
      dispatch(fetchAccountTransaction(accountInfo.account_number));
    }
  }, [accountInfo.account_balance]);

  console.log("transaction", transactions);

  type RecipientWithName = {
    id: string;
    identity: {
      name: string;
      phone: string;
      avt: string;
    };
    bank: string;
    account_number: string;
    reminder_name: string;
  };

  const [inBeneficiaries, setInBeneficiaries] = useState<RecipientWithName[]>([]);

  const [totalSent, setTotalSent] = useState(0); // Tổng tiền đã chuyển
  const [totalReceived, setTotalReceived] = useState(0); // Tổng tiền đã nhận

  const [totalsLoaded, setTotalsLoaded] = useState(false); // Trạng thái để kiểm tra đã load chưa

  useEffect(() => {
    if (!totalsLoaded && transactions.length > 0) {
      calculateTotals();
      setTotalsLoaded(true);
    }
  }, [transactions, totalsLoaded]);

  const calculateTotals = () => {
    const totalSent = transactions.reduce((total, transaction) => {
      if (transaction.sender_info.account_number === accountInfo.account_number) {
        return total + transaction.amount;
      }
      return total;
    }, 0);

    const totalReceived = transactions.reduce((total, transaction) => {
      if (transaction.recipient_info.account_number === accountInfo.account_number) {
        return total + transaction.amount;
      }
      return total;
    }, 0);

    setTotalSent(totalSent);
    setTotalReceived(totalReceived);
    console.log("Tổng số tiền đã chuyển:", totalSent);
    console.log("Tổng số tiền đã nhận:", totalReceived);
  };

  useEffect(() => {
    const fetchRecipientsWithNames = async () => {
      if (!recipients || recipients.length === 0) return;

      const recipientsWithNames = await Promise.all(
        recipients.map(async (recipient) => {
          try {
            let accountData: { name?: string } | null = null;
            let bankName = "";
            if (recipient.bank_id !== "6750a0c9a9dc441ad3fbfb9f") {
              accountData = await dispatch(fetchExternalAccount({
                account_number: recipient.account_number,
                bank_id: recipient.bank_id,
              })).unwrap();

              const bankData = await dispatch(fetchBankById(recipient.bank_id)).unwrap();
              bankName = bankData.name || "Unknown Bank";
            } else {
              accountData = await dispatch(fetchTransactionTarget(recipient.account_number)).unwrap();
              bankName = "Nhom10Bank";
            }
            return {
              id: recipient.account_number,
              identity: {
                name: accountData?.name || "Unknown",
                phone: "Not Available",
                avt: "https://lh4.googleusercontent.com/proxy/-BvxvtLr9pzhfvVNx1CNxelUNQxeRwpfgobPfy46t5-c6_4kMIM_UUraqWpbcTNljDQQEUckfIVgZv00cDJMc3ZZdyOgrp5-PK5t8eDHCkNxupTIE4C7VIB4",
              },
              bank: bankName,
              account_number: recipient.account_number,
              reminder_name: recipient.reminder_name,
            };
          } catch (error) {
            console.error(`Error fetching name for account_number ${recipient.account_number}:`, error);
            return {
              id: recipient.account_number,
              identity: {
                name: "Unknown",
                phone: "Not Available",
                avt: "https://randomuser.me/api/portraits/placeholder.jpg",
              },
              bank: recipient.bank_id === "6750a0c9a9dc441ad3fbfb9f" ? "Nhom10Bank" : "Unknown Bank",
              account_number: recipient.account_number,
              reminder_name: recipient.reminder_name,
            };
          }
        })
      );

      setInBeneficiaries(recipientsWithNames);
    };

    fetchRecipientsWithNames();
    console.log("BENE", recipients)
    console.log("Inbeneficiary", inBeneficiaries)

  }, [dispatch, recipients]);

  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome Back, {accountInfo.name} 👋</h1>
          <p className="text-gray-400">Here's what's happening with your store today.</p>
        </div>
        <div className="flex justify-between gap-8">
          <div className="p-6 border border-white/20 rounded-3xl mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] shadow-lg flex justify-between items-center w-1/2 hover:border-white transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-green-300">Total Income</p>
              <h2 className="text-2xl font-bold text-white">{totalReceived}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <div className="p-6 border border-white/20 rounded-3xl mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] shadow-lg flex justify-between items-center w-1/2 hover:border-white transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-red-300">Total Outcome</p>
              <h2 className="text-2xl font-bold text-white">{totalSent}</h2>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11l-5-5m0 0l-5 5m5-5v12" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <button className="flex bg-black items-center text-sm font-medium hover:underline" onClick={() => navigate('/dashboard/transaction-history')}>
              See All
              <span className="ml-2 flex justify-center items-center w-6 h-6 bg-black border border-white text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </div>
          <div className="container mx-auto py-3">
            <DataTable columns={transactionColumns} data={converTypeHelper.convertToCustomerTransacrionColumns(transactions, accountInfo.account_number).slice(-5).reverse()} loading={loading} filterable={false} />
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
        <div className="p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Favorite Beneficiary</h3>
            <button className="flex bg-black items-center text-sm font-medium hover:underline" onClick={() => navigate('/dashboard/manage-beneficiaries')}>
              See All
              <span className="ml-2 flex justify-center items-center w-6 h-6 bg-black border border-white text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </div>
          <div className="container mx-auto py-6">
            <Dialog open={isOpenDialog} onOpenChange={(data) => {
              console.log(data);
              dispatch(interactDialog(data));
            }}>
              <DataTable columns={beneficiaryColumns} data={inBeneficiaries} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove This Beneficiary</DialogTitle>
                  <DialogDescription>Are you sure you want to remove this beneficiary?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="submit">Yes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

      </div>

      {/* Fixed Column */}
      <div className="w-1/3 pl-4">
        <div className="rounded-3xl shadow-md mb-8">
          <h3 className="text-xl font-bold mb-4">Account Overview</h3>
          <div className="border border-white/20 bg-black p-6 rounded-3xl shadow-md shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
            <p className="font-bold mb-4">My Card</p>
            <div className="bg-gradient-to-br from-green-400 to-blue-300 rounded-3xl p-8 justify-between relative shadow-md mb-4">
              <div className="text-black font-medium mb-6">{accountInfo.name}</div>

              <div className="text-black text-lg tracking-widest space-y-1 mb-6">
                <p>{accountInfo.account_number}</p>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-black text-sm">{accountInfo.name}</div>
                <div className="text-black text-sm">{timeStampHelper.formatToMonthYear(accountInfo.created_at || "")}</div>
              </div>

              <div className="absolute top-5 right-5 text-black font-bold text-lg">VISA</div>
            </div>
            <p className="font-bold mb-2">Card Balance</p>
            <h2 className="text-2xl font-bold">{currencyHelper.convertToCurrency(accountInfo.account_balance)}</h2>
          </div>
        </div>
        <div className="border border-white/20 bg-black p-6 rounded-3xl shadow-md shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)]">
          <h3 className="text-xl font-bold mb-4">Favorite Beneficiaries</h3>
          {recipients.map((recipient, index) => (
            <div
              key={recipient.account_number || index}
              className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200"
            >
              <div className="flex items-center">
                <img
                  src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" // Thay bằng URL ảnh thực tế nếu có
                  alt="Avatar"
                  className="w-10 h-10 rounded-full mr-2 object-cover"
                />
                <div>
                  <p className="font-bold">{recipient.reminder_name}</p>
                  <p className="text-gray-500 text-sm">{recipient.account_number}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default DashboardUI;