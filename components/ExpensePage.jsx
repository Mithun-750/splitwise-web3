'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'ethers';
import { useContract } from '@/context/ContractContext';

export default function ExpensePage() {
    const { contract, walletAddress } = useContract();
    const [expenses, setExpenses] = useState([]);
    const [showSettled, setShowSettled] = useState(false);
    const [balance, setBalance] = useState('0');

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

    const calculateDays = (timestamp) => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDifferenceInSeconds = currentTimestamp - timestamp;
        const secondsInADay = 86400;
        return Math.floor(timeDifferenceInSeconds / secondsInADay) + 1;
    };

    const handlePayment = async (expenseId, ownerAddress, actualAmount, interestRate, expenseTitle, numOfDays) => {
        if (!contract || !walletAddress) {
            console.error('Wallet not connected');
            return;
        }

        try {
            const actualAmountInEth = Number(formatEther(actualAmount));

            let totalAmountToBePaidInEth = actualAmountInEth + (actualAmountInEth * interestRate * numOfDays) / 100;
            totalAmountToBePaidInEth = Math.round(totalAmountToBePaidInEth * 1000000) / 1000000;

            const description = `Payment for expense ${expenseTitle}. Actual Amount: ${actualAmountInEth} ETH, Interest: ${totalAmountToBePaidInEth - actualAmountInEth}ETH for ${numOfDays} days`;

            const transaction = {
                from: walletAddress,
                to: ownerAddress,
                value: parseEther(totalAmountToBePaidInEth.toString()).toHexString(),
            };

            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transaction],
            });

            await contract.markUserAsPaid(expenseId, walletAddress);
            const updatedExpenses = await contract.getExpensesOfCaller();
            setExpenses(updatedExpenses);
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    const getBalance = async (address) => {
        try {
            if (contract && address) {
                const balance = await contract.getBalance(address);
                console.log(balance)
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
                        (Total Amount You Need to Pay: {balance} ETH)
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

                                <p className="font-medium mb-2">Involved Members:</p>

                                <ul className="space-y-3">
                                    {expense.involvedMembers.map((member, index) => {
                                        member = member.toLowerCase();
                                        const isCurrentUser = member === walletAddress?.toLowerCase();
                                        const isPaymentVisible = isCurrentUser && !expense.hasPaid[index];

                                        return (
                                            <li
                                                key={index}
                                                className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-md"
                                            >
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
                                                        onClick={() => handlePayment(
                                                            expense.id,
                                                            expense.owner,
                                                            amountNeedToPay(expense.amountsOwed, expense.involvedMembers),
                                                            (expense.interestRate?.toNumber() || 0),
                                                            expense.description,
                                                            calculateDays(expense.creationTimestamp.toNumber())
                                                        )}
                                                        className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Pay
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
        </div>
    );
}