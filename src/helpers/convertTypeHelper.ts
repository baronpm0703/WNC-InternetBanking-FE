import { customerAccount, employeeAccount, Identity, Transaction, AccountRole, Debt } from "@/component/Resusable/columns";
import timeStampHelper from "@/helper/convertTimeStamp";
import { AccountInfo } from "@/libs/slices/sliceAccount";
import { BankInfo, TransactionRecord } from "@/libs/slices/sliceTransaction";
const VITE_INTERNAlBANK_ID = import.meta.env.VITE_INTERNAlBANK_ID;

const converTypeHelper = {
  convertToCustomerAccountColumns: (data: AccountInfo[] | undefined | null) => {
    if (!data) return [];
    let object: customerAccount[] = data.map((item: AccountInfo, index) => {
      const random = Math.floor(Math.random() * 100);
      return {
        id: index.toString(),
        phone: item.phone,
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

  convertToEmployeeAccountColumns: (data: AccountInfo[] | undefined | null) => {
    if (!data) return [];
    let object: employeeAccount[] = data.map((item: AccountInfo, index) => {
      const random = Math.floor(Math.random() * 100);
      return {
        id: index.toString(),
        phone: item.phone,
        identity: {
          name: item.name,
          phone: random.toString(),
          avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`
        },
        role: item.role as AccountRole,
        date: timeStampHelper.formatTimestamp(item.created_at || ""),
        email: item.email,
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
        name: item.sender_info?.name || "Unknown Sender",
        phone: "",
        avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`,
      }
      if (selectedAccountNumber === item.sender_info?.account_number) {
        senderCount++
        status = "Transfered";
        identity = {
          name: item.recipient_info?.name || "Unknown Recipient",
          phone: "",
          avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`,
        }
      } else receiveCount ++;
      return {
        ...item,
        id: index.toString(),
        status,
        transaction_date: timeStampHelper.formatTimestamp(item.transaction_date),
        identity,
        bankInfo,
      }
    })
    console.log("Account ", selectedAccountNumber, "have send", senderCount, " have receive: ", receiveCount)
    return object
  },
  convertToAdminransacrionColumns: (data: TransactionRecord[] | undefined | null) => {
    if (!data) return [];
    let receiveCount = 0, senderCount = 0;
    let object: Transaction[] = data.map((item: TransactionRecord, index) => {
      let status: "Received" | "Transfered" = "Received";
      let bankInfo: BankInfo = item.bank_sender_id as BankInfo;
      const random = Math.floor(Math.random() * 100);
      let identity: Identity = {
        name: item.sender_info.name,
        phone: "",
        avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`
      }
      if (VITE_INTERNAlBANK_ID === (item.bank_sender_id as BankInfo)._id) {
        senderCount++
        status = "Transfered";
        bankInfo = item.bank_recipient_id as BankInfo;
        identity = {
          name: item.recipient_info.name,
          phone: "",
          avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`
        }
      } else receiveCount ++;
      return {
        ...item,
        id: index.toString(),
        status,
        transaction_date: timeStampHelper.formatTimestamp(item.transaction_date),
        identity,
        bankInfo,
        bankName: bankInfo.name
      }
    })
    return object
  },

  convertToDebtColumns: (data: any[] | undefined | null) => {
    if (!data) return [];
    let object: Debt[] = data.map((item, index) => {
      const random = Math.floor(Math.random() * 100);
      return {
        id: item.id,
        debtee_number: item.debtee_number,
        debtor_number: item.debtor_number,
        debtee_name: item.debtee_name,
        debtor_name: item.debtor_name,
        bank_id: item.bank_id || "Unknown Bank",
        debtID: item.debtID || `DEBT-${index + 1}`,
        amount: item.amount || 0,
        debtRemind_date: timeStampHelper.formatTimestamp(item.created_at || item.debtRemind_date || ""),
        detail: item.detail || "No details provided",
        status: item.status || "Pending",
        identity: {
          name: item.debtee_info?.name || "Unknown Debtor",
          phone: item.debtor_number || "N/A",
          avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`,
        },
      };
    });
    return object;
  }
  
}

export default converTypeHelper;