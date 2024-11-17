'use client';

import { useState, useEffect } from 'react';
import { useContract } from '@/context/ContractContext';
import { Trophy, Gift, ChevronRight, Award, Coins, Users, Star } from 'lucide-react';

export default function RewardsPage() {
    const { contract, walletAddress } = useContract();
    const [rewardTokens, setRewardTokens] = useState(0);

    useEffect(() => {
        async function loadRewardTokens() {
            if (contract && walletAddress) {
                try {
                    const tokens = await contract.getRewardTokens(walletAddress);
                    setRewardTokens(Number(tokens));
                } catch (error) {
                    console.error('Error loading reward tokens:', error);
                }
            }
        }

        loadRewardTokens();
    }, [contract, walletAddress]);

    if (!contract || !walletAddress) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-gray-200 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-yellow-900/20 border border-yellow-900 rounded-xl p-4 text-yellow-400">
                        Please connect your wallet to view rewards.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-200 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                        Your Rewards Dashboard
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Earn tokens by actively participating in expense management and maintaining good financial habits.
                    </p>
                </div>

                <div className="grid gap-8">
                    {/* Token Balance Card */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-900/50 shadow-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6">
                                <Coins className="w-8 h-8 text-purple-400" />
                                <h2 className="text-2xl font-bold text-gray-200">Token Balance</h2>
                            </div>
                            {rewardTokens === 0 ? (
                                <div className="text-gray-400">
                                    Start settling expenses to earn reward tokens!
                                </div>
                            ) : (
                                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    {rewardTokens} <span className="text-xl font-normal text-gray-400">tokens</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How to Earn Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Quick Stats */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl p-6 hover:border-purple-900 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <Star className="w-6 h-6 text-purple-400" />
                                <h2 className="text-xl font-semibold text-gray-200">Quick Stats</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-800/30 rounded-lg p-4">
                                    <div className="text-sm text-gray-400 mb-1">Total Earned</div>
                                    <div className="text-2xl font-bold text-purple-400">{rewardTokens}</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-4">
                                    <div className="text-sm text-gray-400 mb-1">Settlements</div>
                                    <div className="text-2xl font-bold text-purple-400">
                                        {Math.floor(rewardTokens / 100)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How to Earn Card */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl p-6 hover:border-purple-900 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-6 h-6 text-purple-400" />
                                <h2 className="text-xl font-semibold text-gray-200">How to Earn</h2>
                            </div>
                            <div className="bg-gray-800/30 p-6 rounded-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-purple-500/20 p-3 rounded-lg">
                                        <ChevronRight className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-semibold text-gray-200">Settle Expenses On Time</div>
                                        <div className="text-gray-400 mt-1">
                                            Keep your financial records clean by settling expenses promptly
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-6 bg-purple-500/10 p-3 rounded-lg">
                                    <Coins className="w-5 h-5 text-purple-400" />
                                    <span className="text-purple-400 font-medium">+100 tokens per settlement</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}