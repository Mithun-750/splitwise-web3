'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther, toNumber } from 'ethers';
import { useContract } from '@/context/ContractContext';

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
            // Aggregate amounts owed per unique address
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

            // Prepare and execute batch transactions for each unique address
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

            // Mark each individual expense as settled
            await Promise.all(
                selectedPayments.map((payment) =>
                    contract.markUserAsPaid(payment.expenseId, walletAddress)
                )
            );

            setSelectedPayments([]);  // Clear selection after payment
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
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                    Please connect your wallet to view expenses.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">
                    Your Expenses
                    <span className="ml-2 text-gray-600 text-lg">
                        (Total Balance: {balance} ETH)
                    </span>
                </h2>
            </div>

            <div className="flex space-x-4 mb-6">
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        className="form-radio text-blue-600"
                        checked={!showSettled}
                        onChange={() => setShowSettled(false)}
                    />
                    <span className="ml-2">Unsettled</span>
                </label>
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        className="form-radio text-blue-600"
                        checked={showSettled}
                        onChange={() => setShowSettled(true)}
                    />
                    <span className="ml-2">Settled</span>
                </label>
            </div>

            <div className="space-y-6">
                {expenses.length === 0 ? (
                    <div className="bg-gray-50 rounded-md p-4 text-gray-600 text-center">
                        No {showSettled ? 'settled' : 'unsettled'} expenses found.
                    </div>
                ) : (
                    expenses.map((expense) => {
                        if (showSettled !== expense.isSettled) return null;
                        const isSelected = selectedPayments.some((e) => e.expenseId === expense.id);

                        return (
                            <div
                                key={expense.id}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                            >
                                <h3 className="text-xl font-semibold mb-4">
                                    Description: {expense.description}
                                </h3>

                                <p className="text-gray-700 mb-2">
                                    Expense Owner: {expense.owner === walletAddress ? "You" : expense.owner}
                                </p>

                                <ul className="space-y-3">
                                    {expense.involvedMembers.map((member, index) => {
                                        const isCurrentUser = member.toLowerCase() === walletAddress?.toLowerCase();
                                        const isPaymentVisible = isCurrentUser && !expense.hasPaid[index];

                                        return (
                                            <li key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                                                <span className="font-medium">
                                                    Address: {isCurrentUser ? "You" : member}
                                                </span>
                                                <span className="text-gray-600">
                                                    Amount to Pay: {formatEther(expense.amountsOwed[index])} ETH
                                                </span>
                                                <span className={`px-2 py-1 rounded text-sm ${expense.hasPaid[index]
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {expense.hasPaid[index] ? "Paid" : "Unpaid"}
                                                </span>
                                                {isPaymentVisible && (
                                                    <button
                                                        onClick={() => togglePaymentSelection(expense)}
                                                        className={`ml-auto px-4 py-2 ${isSelected ? "bg-red-600" : "bg-blue-600"} text-white rounded-md hover:bg-blue-700 transition-colors`}
                                                    >
                                                        {isSelected ? "Deselect" : "Select"}
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p className="mt-4 text-gray-600">
                                    Status: {expense.isSettled ? (
                                        <span className="text-green-600">Settled</span>
                                    ) : (
                                        <span className="text-yellow-600">Pending</span>
                                    )}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedPayments.length > 0 && (
                <button
                    onClick={handleGroupPayment}
                    className="mt-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    Pay Selected Expenses
                </button>
            )}
        </div>
    );
}
