"use client"
import { useState, useEffect } from 'react';
import { useContract } from '@/context/ContractContext';
import { Trophy, Award, Gift, Loader2 } from 'lucide-react';

export default function RewardsPage() {
    const { contract, walletAddress, connectionStatus } = useContract();
    const [rewardTokens, setRewardTokens] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRewardTokens = async () => {
            if (contract && walletAddress) {
                try {
                    setIsLoading(true);
                    const tokens = await contract.getRewardTokens(walletAddress);
                    setRewardTokens(Number(tokens));
                    setError(null);
                } catch (err) {
                    console.error("Error fetching reward tokens:", err);
                    setError("Failed to fetch reward tokens. Please try again later.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchRewardTokens();
    }, [contract, walletAddress]);

    if (connectionStatus !== 'connected') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    Please connect your wallet to view your rewards.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold">Your Rewards</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Rewards Card */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-6 h-6 text-blue-500" />
                                <h2 className="text-xl font-semibold">Total Reward Tokens</h2>
                            </div>
                            <p className="text-gray-600">Earned from settling expenses on time</p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                {error}
                            </div>
                        ) : (
                            <div className="text-4xl font-bold text-blue-600">
                                {rewardTokens} <span className="text-lg font-normal text-gray-500">tokens</span>
                            </div>
                        )}
                    </div>

                    {/* Benefits Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Gift className="w-6 h-6 text-green-500" />
                            <h2 className="text-xl font-semibold">Current Benefits</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-700">Early access to new features</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-700">Priority support</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-700">Exclusive member badge</span>
                            </li>
                        </ul>
                    </div>

                    {/* How to Earn Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-xl font-semibold">How to Earn More</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-700">Settle expenses (+100 tokens each)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-700">Participate in group expenses</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-700">Complete your profile</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Token History Section */}
                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="w-6 h-6 text-purple-500" />
                        <h2 className="text-xl font-semibold">Recent Token Activity</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { action: "Settled lunch expense", tokens: "+100", date: "2 days ago" },
                            { action: "Settled group dinner", tokens: "+100", date: "5 days ago" },
                            { action: "Profile completion bonus", tokens: "+50", date: "1 week ago" },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-800">{activity.action}</p>
                                    <p className="text-sm text-gray-500">{activity.date}</p>
                                </div>
                                <span className="text-green-500 font-semibold">{activity.tokens}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}