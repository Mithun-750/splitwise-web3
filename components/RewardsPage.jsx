"use client"
import { useState, useEffect } from 'react';
import { useContract } from '@/context/ContractContext';
import { Trophy, Award, Gift, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription>
                        Please connect your wallet to view your rewards.
                    </AlertDescription>
                </Alert>
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
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-6 h-6 text-blue-500" />
                                Total Reward Tokens
                            </CardTitle>
                            <CardDescription>
                                Earned from settling expenses on time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : error ? (
                                <Alert className="bg-red-50 border-red-200">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="text-4xl font-bold text-blue-600">
                                    {rewardTokens} <span className="text-lg font-normal text-gray-500">tokens</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Benefits Cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="w-6 h-6 text-green-500" />
                                Current Benefits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Early access to new features</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Priority support</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Exclusive member badge</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                How to Earn More
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span>Settle expenses (+100 tokens each)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span>Participate in group expenses</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span>Complete your profile</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}