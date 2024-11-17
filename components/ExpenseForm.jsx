'use client';

import { useState } from 'react';
import { parseEther } from 'ethers';
import { useContract } from '@/context/ContractContext';
import { Plus, X, Users, FileText, Percent } from 'lucide-react';

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

    const removeMember = (index) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-200 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Create Expense
                </h2>

                <form onSubmit={handleCreateExpense} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                required
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-200 placeholder-gray-500"
                            />
                        </div>

                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="number"
                                required
                                placeholder="Interest percentage per day"
                                value={formData.interestRate}
                                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-200 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" />
                            Add Members
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-200 placeholder-gray-500"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Amount in ETH"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-200 placeholder-gray-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddMember}
                                        className="px-4 py-3 bg-purple-500/20 border border-purple-500 rounded-xl hover:bg-purple-500/30 transition-all duration-200"
                                    >
                                        <Plus className="w-5 h-5 text-purple-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-800"
                                    >
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <span className="text-gray-300 truncate">
                                                {member.address.slice(0, 6)}...{member.address.slice(-4)}
                                            </span>
                                            <span className="text-purple-400">{member.amount} ETH</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMember(index)}
                                            className="ml-2 p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className={`p-4 rounded-xl ${
                            successMessage.includes('Error')
                                ? 'bg-red-900/20 border border-red-900 text-red-400'
                                : 'bg-green-900/20 border border-green-900 text-green-400'
                        }`}>
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={members.length === 0}
                        className={`w-full py-3 rounded-xl transition-all duration-200 ${
                            members.length === 0
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500 hover:bg-purple-500/30'
                        }`}
                    >
                        Create Expense
                    </button>
                </form>
            </div>
        </div>
    );
}