'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther, toNumber } from 'ethers';
import { useContract } from '@/context/ContractContext';
import { Wallet, Clock, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function ExpensePage() {
    const { contract, walletAddress } = useContract();
    const [expenses, setExpenses] = useState([]);
    const [showSettled, setShowSettled] = useState(false);
    const [balance, setBalance] = useState('0');
    const [selectedPayments, setSelectedPayments] = useState([]);

    useEffect(() => {
        async function loadExpenses() {
            if (contract && walletAddress) {
                try {
                    const callerExpenses = await contract.getExpensesOfCaller();
                    setExpenses(callerExpenses);

                    const userBalance = await getBalance(walletAddress);
                    setBalance(userBalance);
                } catch (error) {
                    console.error('Error loading expenses:', error);
                }
            }
        }

        loadExpenses();
    }, [contract, walletAddress]);

    const amountNeedToPay = (amountsOwed, involvedMembers) => {
        for (let i = 0; i < involvedMembers.length; i++) {
            if (involvedMembers[i].toLowerCase() === walletAddress?.toLowerCase()) {
                return amountsOwed[i];
            }
        }
        return 0;
    };

    const handleGroupPayment = async () => {
        if (!contract || !walletAddress || selectedPayments.length === 0) {
            console.error('No payments selected or wallet not connected');
            return;
        }

        try {
            const addressToAmountMap = selectedPayments.reduce((acc, payment) => {
                const { actualAmount, interestRate, numOfDays, owner } = payment;
                const amountInEth = Number(formatEther(actualAmount));
                const totalToBePaid = amountInEth + (amountInEth * interestRate * numOfDays) / 100;

                if (!acc[owner]) {
                    acc[owner] = 0;
                }
                acc[owner] += totalToBePaid;
                return acc;
            }, {});

            const transactions = Object.keys(addressToAmountMap).map((address) => ({
                from: walletAddress,
                to: address,
                value: parseEther(addressToAmountMap[address].toString()).toString(16),
            }));

            await Promise.all(transactions.map((tx) =>
                window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [tx],
                })
            ));

            // Collect all expense IDs that were paid
            const expenseIds = selectedPayments.map(payment => payment.expenseId);

            // Mark all selected expenses as paid in a single contract call
            await contract.markUserAsPaid(expenseIds, walletAddress);

            setSelectedPayments([]);
            const updatedExpenses = await contract.getExpensesOfCaller();
            setExpenses(updatedExpenses);
        } catch (error) {
            console.error('Error processing group payment:', error);
        }
    };

    const togglePaymentSelection = (expense) => {
        const isSelected = selectedPayments.some((e) => e.expenseId === expense.id);
        if (isSelected) {
            setSelectedPayments((prev) => prev.filter((e) => e.expenseId !== expense.id));
        } else {
            const numOfDays = calculateDays(toNumber(expense.creationTimestamp));
            setSelectedPayments((prev) => [
                ...prev,
                {
                    expenseId: expense.id,
                    owner: expense.owner,
                    actualAmount: amountNeedToPay(expense.amountsOwed, expense.involvedMembers),
                    interestRate: toNumber(expense.interestRate),
                    numOfDays,
                },
            ]);
        }
    };

    const calculateDays = (timestamp) => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return Math.floor((currentTimestamp - timestamp) / 86400) + 1;
    };

    const getBalance = async (address) => {
        try {
            if (contract && address) {
                const balance = await contract.getBalance(address);
                return formatEther(balance);
            }
            return '0';
        } catch (error) {
            console.error('Error fetching balance:', error);
            return '0';
        }
    };

    if (!contract || !walletAddress) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-gray-200 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-yellow-900/20 border border-yellow-900 rounded-xl p-4 text-yellow-400">
                        Please connect your wallet to view expenses.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-200 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div className="mb-4 sm:mb-0">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Your Expenses
                        </h2>
                        <p className="text-gray-400 mt-2">
                            Balance: <span className="text-purple-400 font-medium">{balance} ETH</span>
                        </p>
                    </div>

                    <div className="flex space-x-4">
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
                </div>

                <div className="space-y-6">
                    {expenses.length === 0 ? (
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 text-gray-400 text-center">
                            No {showSettled ? 'settled' : 'unsettled'} expenses found.
                        </div>
                    ) : (
                        expenses.map((expense) => {
                            if (showSettled !== expense.isSettled) return null;
                            const isSelected = selectedPayments.some((e) => e.expenseId === expense.id);
                            const amountToPay = amountNeedToPay(expense.amountsOwed, expense.involvedMembers);
                            const numOfDays = calculateDays(toNumber(expense.creationTimestamp));
                            const interestAmount = (Number(formatEther(amountToPay)) * Number(expense.interestRate) * numOfDays) / 100;
                            const totalAmount = Number(formatEther(amountToPay)) + interestAmount;

                            return (
                                <div
                                    key={expense.id}
                                    className={`bg-[#1a1a1a] rounded-xl border shadow-xl p-6 transition-all duration-300 ${
                                        isSelected ? 'border-purple-500' : 'border-gray-800 hover:border-purple-900'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-200 mb-2">
                                                {expense.description}
                                            </h3>
                                            <p className="text-gray-400 flex items-center gap-2">
                                                <Wallet className="w-4 h-4" />
                                                Owner: {expense.owner === walletAddress ? "You" : `${expense.owner.slice(0, 6)}...${expense.owner.slice(-4)}`}
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="flex items-center gap-2 bg-gray-800/30 rounded-lg p-4">
                                            <DollarSign className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Amount</p>
                                                <p className="text-lg font-semibold text-purple-400">
                                                    {formatEther(amountToPay)} ETH
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-800/30 rounded-lg p-4">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Days Elapsed</p>
                                                <p className="text-lg font-semibold text-purple-400">{numOfDays}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-800/30 rounded-lg p-4">
                                            <AlertCircle className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Interest ({expense.interestRate}% per day)</p>
                                                <p className="text-lg font-semibold text-purple-400">
                                                    {interestAmount.toFixed(6)} ETH
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {expense.involvedMembers.map((member, index) => {
                                            const isCurrentUser = member.toLowerCase() === walletAddress?.toLowerCase();
                                            const isPaymentVisible = isCurrentUser && !expense.hasPaid[index];

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/30 rounded-xl"
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
                                                                {expense.hasPaid[index] ? 'Paid' : 'Unpaid'}
                                                            </span>
                                                        </div>

                                                        {isPaymentVisible && (
                                                            <button
                                                                onClick={() => togglePaymentSelection(expense)}
                                                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                                                    isSelected
                                                                        ? 'bg-red-500/20 text-red-400 border border-red-500'
                                                                        : 'bg-purple-500/20 text-purple-400 border border-purple-500 hover:bg-purple-500/30'
                                                                }`}
                                                            >
                                                                {isSelected ? 'Deselect' : 'Select'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {selectedPayments.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl p-4 z-50">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-purple-400">
                                    {selectedPayments.length} payment(s) selected
                                </span>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-purple-400" />
                                    <span className="text-purple-400 font-medium">
                                        {selectedPayments.reduce((total, payment) => {
                                            const amountInEth = Number(formatEther(payment.actualAmount));
                                            const interest = (amountInEth * payment.interestRate * payment.numOfDays) / 100;
                                            return total + amountInEth + interest;
                                        }, 0).toFixed(6)} ETH
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleGroupPayment}
                                className="px-6 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500 hover:bg-purple-500/30 transition-all duration-200"
                            >
                                Pay Selected
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
