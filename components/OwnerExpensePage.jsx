"use client"
import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { useContract } from "@/context/ContractContext";
import { Wallet, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-[#0A0A0A] text-gray-200 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Your Expenses as Owner
                </h2>

                {/* Toggle Switch */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setShowSettled(false)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            !showSettled
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-purple-500/50'
                        }`}
                    >
                        Unsettled
                    </button>
                    <button
                        onClick={() => setShowSettled(true)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            showSettled
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-purple-500/50'
                        }`}
                    >
                        Settled
                    </button>
                </div>

                {/* Expenses List */}
                <div className="grid gap-6">
                    {expenses.map((expense) => {
                        if (showSettled !== expense.isSettled) return null;

                        return (
                            <div
                                key={expense.id}
                                className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl p-6 hover:border-purple-900 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-200 mb-2">
                                            {expense.description}
                                        </h3>
                                        <p className="text-gray-400 flex items-center gap-2">
                                            <Wallet className="w-4 h-4" />
                                            Owner: You
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        expense.isSettled
                                            ? 'bg-green-900/20 text-green-400 border border-green-900'
                                            : 'bg-yellow-900/20 text-yellow-400 border border-yellow-900'
                                    }`}>
                                        {expense.isSettled ? 'Settled' : 'Pending'}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {expense.involvedMembers.map((member, index) => {
                                        const isCurrentUser = member.toLowerCase() === walletAddress;

                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-800"
                                            >
                                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                    <span className="text-gray-300">
                                                        {isCurrentUser ? "You" : `${member.slice(0, 6)}...${member.slice(-4)}`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-purple-400" />
                                                        <span className="text-purple-400 font-medium">
                                                            {formatEther(expense.amountsOwed[index])} ETH
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {expense.hasPaid[index] ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-400" />
                                                        )}
                                                        <span className={`text-sm font-medium ${
                                                            expense.hasPaid[index] ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            {expense.hasPaid[index] ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OwnerExpensePage;