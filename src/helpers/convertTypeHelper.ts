import { customerAccount, Identity, Transaction } from "@/component/Resusable/columns";
import timeStampHelper from "@/helper/convertTimeStamp";
import { AccountInfo } from "@/libs/slices/sliceAccount";
import { TransactionRecord } from "@/libs/slices/sliceTransaction";

const converTypeHelper = {
  convertToCustomerAccountColumns: (data: AccountInfo[] | undefined | null) => {
    if (!data) return [];
    let object: customerAccount[] = data.map((item: AccountInfo, index) => {
      const random = Math.floor(Math.random() * 100);
      return {
        id: index.toString(),
        identity: {
          name: item.name,
          phone: random.toString(),
          avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`
        },
        date: timeStampHelper.formatTimestamp(item.created_at || ""),
        email: item.email,
        accountNumber: item.account_number,
        accountBalance: item.account_balance,
      }
    })
    return object;
  },

  convertToCustomerTransacrionColumns: (data: TransactionRecord[] | undefined | null, selectedAccountNumber: string | undefined | null) => {
    if (!data || !selectedAccountNumber) return [];
    let receiveCount = 0, senderCount = 0;
    let object: Transaction[] = data.map((item: TransactionRecord, index) => {
      let status: "Received" | "Transfered" = "Received";
      let bankInfo = item.bank_recipient_id === item.bank_sender_id ? "Internal" : "External";
      const random = Math.floor(Math.random() * 100);
      let identity: Identity = {
        name: item.sender_info.name,
        phone: "",
        avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`
      }
      if (selectedAccountNumber === item.sender_info.account_number) {
        senderCount++
        status = "Transfered";
        identity = {
          name: item.recipient_info.name,
          phone: "",
          avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`
        }
      } else receiveCount ++;
      return {
        id: index.toString(),
        status,
        identity,
        bankInfo,
        ...item
      }
    })
    console.log("Account ", selectedAccountNumber, "have send", senderCount, " have receive: ", receiveCount)
    return object
  }
}

export default converTypeHelper;