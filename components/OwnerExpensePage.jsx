"use client"
import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { useContract } from "@/context/ContractContext";

const OwnerExpensePage = () => {
    const { contract, walletAddress } = useContract();
    const [expenses, setExpenses] = useState([]);
    const [showSettled, setShowSettled] = useState(false);

    useEffect(() => {
        async function loadExpenses() {
            if (contract && walletAddress) {
                const ownerExpenses = await contract.getExpensesByOwner(walletAddress);
                setExpenses(ownerExpenses);
            }
        }
        loadExpenses();
    }, [contract, walletAddress]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Your Expenses as Owner</h2>

            {/* Toggle Switch */}
            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setShowSettled(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${!showSettled
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Unsettled
                </button>
                <button
                    onClick={() => setShowSettled(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${showSettled
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Settled
                </button>
            </div>

            {/* Expenses List */}
            <div className="space-y-4">
                {expenses.map((expense) => {
                    if (showSettled !== expense.isSettled) return null;

                    return (
                        <div
                            key={expense.id}
                            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                        >
                            <h3 className="text-xl font-semibold mb-3">
                                {expense.description}
                            </h3>
                            <p className="text-gray-600 mb-2">Expense Owner: You</p>

                            <div className="mt-4">
                                <p className="font-medium mb-2">Involved Members:</p>
                                <div className="space-y-2">
                                    {expense.involvedMembers.map((member, index) => {
                                        const isCurrentUser = member.toLowerCase() === walletAddress;

                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <span className="text-gray-700 mb-2 sm:mb-0">
                                                    {isCurrentUser ? "You" : `${member.slice(0, 6)}...${member.slice(-4)}`}
                                                </span>

                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                                    <span className="text-blue-600 font-medium">
                                                        {formatEther(expense.amountsOwed[index])} ETH
                                                    </span>

                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expense.hasPaid[index]
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {expense.hasPaid[index] ? 'Paid' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${expense.isSettled
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {expense.isSettled ? 'Settled' : 'Pending Settlement'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OwnerExpensePage;