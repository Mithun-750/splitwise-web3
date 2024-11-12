'use client';

import { useState } from 'react';
import { parseEther } from 'ethers';
import { useContract } from '@/context/ContractContext';

export default function ExpenseForm() {
    const { contract } = useContract();
    const [formData, setFormData] = useState({
        address: '',
        amount: '',
        description: '',
        interestRate: ''
    });
    const [members, setMembers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddMember = () => {
        const { address, amount } = formData;
        const amountPattern = /^\d+(\.\d{0,2})?/;

        if (address && amount && amountPattern.test(amount)) {
            setMembers([...members, { address, amount }]);
            setFormData({
                ...formData,
                address: '',
                amount: ''
            });
        } else {
            alert('Please enter a valid amount in Ether (e.g., 0.01 ETH with up to 2 decimal places).');
        }
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        if (!contract) {
            setSuccessMessage('Please connect your wallet first.');
            return;
        }

        if (members.length > 0) {
            try {
                const memberAddresses = members.map((member) => member.address);
                const memberAmounts = members.map((member) =>
                    parseEther(member.amount.toString())
                );
                const { description, interestRate } = formData;

                const tx = await contract.createExpense(
                    memberAddresses,
                    memberAmounts,
                    description,
                    interestRate
                );
                await tx.wait();
                setSuccessMessage('Expense created successfully!');
                setMembers([]);
                setFormData({ address: '', amount: '', description: '', interestRate: '' });
            } catch (error) {
                console.error('Error creating expense:', error);
                setSuccessMessage('Error creating expense. Please try again.');
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Expense</h2>

            <form onSubmit={handleCreateExpense} className="space-y-4">
                <div className="space-y-4">
                    <input
                        type="text"
                        required
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="number"
                        required
                        placeholder="Interest percentage per day"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Add Members</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="text"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="button"
                            onClick={handleAddMember}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Add One More Member
                        </button>
                    </div>
                </div>

                {members.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Added Members:</h3>
                        <ul className="space-y-2 text-black">
                            {members.map((member, index) => (
                                <li
                                    key={index}
                                    className="p-3 bg-gray-50 rounded-md"
                                >
                                    <span className="font-medium">Address:</span> {member.address}
                                    <br />
                                    <span className="font-medium">Amount:</span> {member.amount} ETH
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!contract}
                    className={`w-full px-4 py-2 text-white rounded-md transition-colors mt-6 ${contract
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    {contract ? 'Submit' : 'Please Connect Wallet'}
                </button>
            </form>

            {successMessage && (
                <div className={`mt-4 p-4 rounded-md ${successMessage.includes('Error') || successMessage.includes('connect')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    {successMessage}
                </div>
            )}
        </div>
    );
}