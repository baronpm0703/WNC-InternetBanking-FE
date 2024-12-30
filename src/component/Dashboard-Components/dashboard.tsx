import timeStampHelper from "@/helper/convertTimeStamp";
import currencyHelper from "@/helper/currencyHelper";
import { useAppSelector } from "@/libs/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardUI = () => {
  const navigate = useNavigate();
  const { error, accountInfo } = useAppSelector(state => state.account);
  useEffect(() => {
    console.log("Before Move Account Info: ", accountInfo);
    if (accountInfo.role !== "Customer") {
      navigate(`/${accountInfo.role}`);
    }
  }, [accountInfo.role]);

  const recipients = accountInfo.recipient_list?.[0]?.recipient_list || [];

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
              <h2 className="text-2xl font-bold text-white">$632,000</h2>
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
              <h2 className="text-2xl font-bold text-white">$632,000</h2>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11l-5-5m0 0l-5 5m5-5v12" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Transaction</h3>
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
          <table className="w-full">
            <thead>
              <tr className="text-left border-b text-green-400 border-gray-700">
                <th className="py-2">Name</th>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  John
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$80.09</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Debt Reminders</h3>
            <button className="flex bg-black items-center text-sm font-medium hover:underline" onClick={() => navigate('/dashboard/debt-reminders')}>
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
          <table className="w-full">
            <thead>
              <tr className="text-left border-b text-green-400 border-gray-700">
                <th className="py-2">Debtor</th>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  John
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$80.09</td>
                <td className="py-2">
                  <span className="bg-yellow-300 text-black px-4 py-1 rounded-full text-xs">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Paid
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  John
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$80.09</td>
                <td className="py-2">
                  <span className="bg-yellow-300 text-black px-4 py-1 rounded-full text-xs">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="border-b border-transparent hover:text-green-200">
                <td className="py-3 flex items-center">
                  <img
                    src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  Sweety
                </td>
                <td className="py-2 text-sm">Apr 20, 9:30 AM</td>
                <td className="py-2">$7.03</td>
                <td className="py-2">
                  <span className="bg-green-300 text-black px-4 py-1 rounded-full text-xs">
                    Deposited
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
}

export default DashboardUI;