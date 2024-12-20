import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ItemDropdown from './dropdown';
import ItemDropdownAccountInterBank from "./dropdownAccountInterBank";

const TransferUI = () => {
  const [activeTab, setActiveTab] = useState("sameBank");
  const navigate = useNavigate();
  const [isDropdownOpenTransferFrom, setIsDropdownOpenTransferFrom] = useState(false);
  const [isDropdownOpenTransferTo, setIsDropdownOpenTransferTo] = useState(false);
  const [isDropdownOpenSelectBank, setIsDropdownOpenSelectBank] = useState(false);

  const [selectedTransferTo, setSelectedTransferTo] = useState({ attribute1: '', attribute2: '' });
  const [selectedInterBankTransferTo, setSelectedInterBankTransferTo] = useState({ attribute1: '', attribute2: '', attribute3: '' });
  const [selectedAccount, setSelectedAccount] = useState({ attribute1: '', attribute2: '' });
  const [isDropdownOpenInterBankTransferTo, setIsDropdownOpenInterBankTransferTo] = useState(false);
  const [selectedBank, setSelectedBank] = useState({ attribute1: '', attribute2: '' });

  const toggleDropdownTransferFrom = () => {
    setIsDropdownOpenTransferFrom(!isDropdownOpenTransferFrom);
    setIsDropdownOpenTransferTo(false);
    setIsDropdownOpenSelectBank(false);
    setIsDropdownOpenInterBankTransferTo(false);
  };

  const toggleDropdownTransferTo = () => {
    setIsDropdownOpenTransferTo(!isDropdownOpenTransferTo);
    setIsDropdownOpenTransferFrom(false);
    setIsDropdownOpenInterBankTransferTo(false);
    setIsDropdownOpenSelectBank(false);
  };

  const toggleDropdownSelectBank = () => {
    setIsDropdownOpenSelectBank(!isDropdownOpenSelectBank);
    setIsDropdownOpenTransferFrom(false);
    setIsDropdownOpenInterBankTransferTo(false);
    setIsDropdownOpenTransferTo(false);
  };

  const toggleDropdownInterBankTransferTo = () => {
    setIsDropdownOpenInterBankTransferTo(!isDropdownOpenInterBankTransferTo);
    setIsDropdownOpenTransferFrom(false);
    setIsDropdownOpenTransferTo(false);
    setIsDropdownOpenSelectBank(false);
    setIsDropdownOpenTransferFrom(false);
  };

  const setActiveTabAndCloseDropdowns = (tab: string) => {
    setActiveTab(tab);
    setIsDropdownOpenTransferFrom(false);
    setIsDropdownOpenTransferTo(false);
    setIsDropdownOpenSelectBank(false);
    setIsDropdownOpenInterBankTransferTo(false);
  };

  return (
    <div className="text-white font-sans flex">
      <div className="flex-1 rounded-3xl">
        {/* Tabs */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Transfer Money</h1>
          <p className="text-gray-400">Your Money, Your Control!</p>
        </div>
        <div className="bg-black p-6 rounded-3xl border border-white/20 shadow-lg overflow-y-auto pr-4">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTabAndCloseDropdowns("sameBank")}
              className={`flex-1 py-3 font-bold rounded-2xl ${activeTab === "sameBank"
                ? "bg-white text-black"
                : "bg-black text-white border border-gray-600"
                }`}
            >
              Same Bank
            </button>
            <button
              onClick={() => setActiveTabAndCloseDropdowns("interBank")}
              className={`flex-1 py-3 font-bold rounded-2xl ${activeTab === "interBank"
                ? "bg-white text-black"
                : "bg-black text-white border border-gray-600"
                }`}
            >
              InterBank
            </button>
          </div>

          {/* Form Logic */}
          {activeTab === "sameBank" ? (
            <form>
              {/* Transfer From and To */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200" onClick={toggleDropdownTransferFrom}>
                  <label className="block text-white text-xs mb-1">Transfer From</label>
                  <div className="flex justify-between items-center">
                    {selectedAccount.attribute1 === '' ? (
                      <span className="text-gray-500">Select Account</span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-white font-bold">{selectedAccount.attribute1}</span>
                        <span className="text-gray-500 ml-2">- {selectedAccount.attribute2}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {isDropdownOpenTransferFrom && (
                    <ItemDropdown
                      title="Select Source Account"
                      items={[
                        { attribute1: 'John Paul', attribute2: '2222222222222222' },
                        { attribute1: 'Kenijen', attribute2: '1234567890122937' },
                        { attribute1: 'Kendrick', attribute2: '4444444444444444' },
                      ]}
                      selectedItem={selectedAccount}
                      setSelectedItem={setSelectedAccount}
                      isDropdownOpen={isDropdownOpenTransferFrom}
                      setIsDropdownOpen={setIsDropdownOpenTransferFrom}
                    />
                  )}
                </div>

                <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200">
                  <label className="block text-white text-xs mb-1">Transfer To</label>
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
                          onClick={() => setSelectedTransferTo({ attribute1: '', attribute2: '' })}
                          className="ml-2 text-white-500 hover:text-white-700 cursor-pointer"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white" onClick={toggleDropdownTransferTo}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
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

              {/* Save As Beneficiary */}
              <div className="flex items-center mb-6">
                <input type="checkbox" id="save-beneficiary" className="form-checkbox text-green-500 h-5 w-5" />
                <label htmlFor="save-beneficiary" className="text-gray-100 ml-2">
                  Save As Beneficiary
                </label>
              </div>

              {/* Amount and Purpose */}
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
                  <label className="block text-gray-400 text-sm mb-1">Purpose of Transfer</label>
                  <input
                    type="text"
                    placeholder="Tien an sang hom nay"
                    className="w-full py-6 px-4 bg-gray-900 text-white rounded-2xl border border-gray-800 focus:outline-none border border-gray-800 hover:border-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Fee Payer */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Fee Payer:</p>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="fee-payer"
                      className="form-radio text-green-500 focus:ring-0"
                    />
                    <span className="text-white">Sender</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="fee-payer"
                      className="form-radio text-green focus:ring-0"
                    />
                    <span className="text-white">Receiver</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full">
                Transfer
              </button>
            </form>
          ) : (
            <form>
              {/* InterBank Form */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200" onClick={toggleDropdownTransferFrom}>
                  <label className="block text-white text-xs mb-1">Transfer From</label>
                  <div className="flex justify-between items-center">
                    {selectedAccount.attribute1 === '' ? (
                      <span className="text-gray-500">Select Account</span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-white font-bold">{selectedAccount.attribute1}</span>
                        <span className="text-gray-500 ml-2">- {selectedAccount.attribute2}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {isDropdownOpenTransferFrom && (
                    <ItemDropdown
                      title="Select Source Account"
                      items={[
                        { attribute1: 'John Paul', attribute2: '2222222222222222' },
                        { attribute1: 'Kenijen', attribute2: '1234567890122937' },
                        { attribute1: 'Kendrick', attribute2: '4444444444444444' },
                      ]}
                      selectedItem={selectedAccount}
                      setSelectedItem={setSelectedAccount}
                      isDropdownOpen={isDropdownOpenTransferFrom}
                      setIsDropdownOpen={setIsDropdownOpenTransferFrom}
                    />
                  )}
                </div>

                <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200" onClick={toggleDropdownSelectBank}>
                  <label className="block text-white text-xs mb-1">To Bank</label>
                  <div className="flex justify-between items-center">
                    {selectedBank.attribute1 === '' ? (
                      <span className="text-gray-500">Select Bank</span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-white font-bold">{selectedBank.attribute1}</span>
                        <span className="text-gray-500 ml-2">- {selectedBank.attribute2}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {isDropdownOpenSelectBank && (
                    <ItemDropdown
                      title="Select Bank"
                      items={[
                        { attribute1: 'DONG A BANK', attribute2: 'Dong A Commercial Joint stock Bank' },
                        { attribute1: 'MB BANK', attribute2: 'MB Commercial Joint stock Bank' },
                        { attribute1: 'TP BANK', attribute2: 'TienPhong Commercial Joint stock Bank' },
                        { attribute1: 'VP BANK', attribute2: 'VP Commercial Joint stock Bank' },
                      ]}
                      selectedItem={selectedBank}
                      setSelectedItem={setSelectedBank}
                      isDropdownOpen={isDropdownOpenSelectBank}
                      setIsDropdownOpen={setIsDropdownOpenSelectBank}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200">
                    <label className="block text-white text-xs mb-1">Account Number</label>
                    <div className="flex items-center">
                      {selectedInterBankTransferTo.attribute1 === '' ? (
                        <input
                          type="text"
                          placeholder="Enter Account Number"
                          className="bg-transparent w-full text-white font-bold focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center">
                          <span className="text-white font-bold">{selectedInterBankTransferTo.attribute1}</span>
                          <span className="text-gray-500 ml-2">- {selectedInterBankTransferTo.attribute2}</span>
                          <FontAwesomeIcon
                            icon={faTrash}
                            onClick={() => setSelectedInterBankTransferTo({ attribute1: '', attribute2: '', attribute3: '' })}
                            className="ml-2 text-white-500 hover:text-white-700 cursor-pointer"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white ml-2"  onClick={toggleDropdownInterBankTransferTo}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {isDropdownOpenInterBankTransferTo && (
                      <ItemDropdownAccountInterBank
                      title="Select Beneficiary Account"
                      items={[
                        { attribute1: 'John Paul',attribute2: 'Dong A Bank',  attribute3: '2222222222222222' },
                        { attribute1: 'Kenijen',attribute3: 'MB Bank', attribute2: '1234567890122937',  },
                        { attribute1: 'Kendrick', attribute3: 'TP Bank', attribute2: '4444444444444444' },
                      ]}
                      selectedItem={selectedInterBankTransferTo}
                      setSelectedItem={setSelectedInterBankTransferTo}
                      isDropdownOpen={isDropdownOpenInterBankTransferTo}
                      setIsDropdownOpen={setIsDropdownOpenInterBankTransferTo}
                    />
                    )}
                  </div>

                  <div className="relative w-full bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-800 hover:border-white transition-all duration-200">
                    <label className="block text-white text-xs mb-1">Account Name</label>
                    <input
                      type="text"
                      placeholder="Enter account name"
                      className="bg-transparent w-full text-white font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              {/* Save As Beneficiary */}
              <div className="flex items-center mb-6">
                <input type="checkbox" id="save-beneficiary" className="form-checkbox text-green-500 h-5 w-5" />
                <label htmlFor="save-beneficiary" className="text-gray-400 ml-2">
                  Save As Beneficiary
                </label>
              </div>

              {/* Amount and Purpose */}
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
                  <label className="block text-gray-400 text-sm mb-1">Purpose of Transfer</label>
                  <input
                    type="text"
                    placeholder="Tien an sang hom nay"
                    className="w-full py-6 px-4 bg-gray-900 text-white rounded-2xl border border-gray-800 focus:outline-none border border-gray-800 hover:border-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Fee Payer */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Fee Payer:</p>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="fee-payer"
                      className="form-radio text-green-500 focus:ring-0"
                    />
                    <span className="text-white">Sender</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="fee-payer"
                      className="form-radio text-green-500 focus:ring-0"
                    />
                    <span className="text-white">Receiver</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full py-3 bg-[#B9FF66] text-black font-bold rounded-full">
                Transfer
              </button>
            </form>
          )}
        </div>
        <div className="mt-8 p-6 border border-white/20 rounded-3xl shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)] transition-all duration-200 hover:border-white">
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
      </div>
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
        <div className="border border-white/20 bg-black p-6 rounded-3xl shadow-md shadow-md mb-8 bg-black shadow-[0px_4px_0px_0px_rgba(255,255,255)]">
          <h3 className="text-xl font-bold mb-4">Favorite Beneficiaries</h3>
          <div className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200">
            <div className="flex items-center w-1/2">
              <img src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-bold">John Paul</p>
                <p className="text-gray-500 text-sm">1234567890122937</p>
              </div>
            </div>
            {/* Repeat for other beneficiaries */}
          </div>
          <div className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200">
            <div className="flex items-center w-1/2">
              <img src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-bold">John Paul</p>
                <p className="text-gray-500 text-sm">1234567890122937</p>
              </div>
            </div>
            {/* Repeat for other beneficiaries */}
          </div>
          <div className="flex flex-wrap bg-transparent rounded-2xl p-2 mb-2 hover:bg-blue-300/20 transition-all duration-200">
            <div className="flex items-center w-1/2">
              <img src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-bold">John Paul</p>
                <p className="text-gray-500 text-sm">1234567890122937</p>
              </div>
            </div>
            {/* Repeat for other beneficiaries */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferUI;