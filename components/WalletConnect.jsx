"use client"
import React, { useState, useCallback } from 'react';
import { useContract } from '@/context/ContractContext';
import { X, Wallet, ExternalLink, LogOut } from 'lucide-react';

const WalletConnect = ({ className = "" }) => {
    const { connectWallet, disconnectWallet, isConnecting, walletAddress, error } = useContract();
    const [isPending, setIsPending] = useState(false);
    const [showError, setShowError] = useState(true);

    const handleConnect = useCallback(async () => {
        if (isPending || isConnecting) return;
        setShowError(true);

        try {
            setIsPending(true);
            const isLocked = window.ethereum?._metamask?.isUnlocked?.() === false;
            if (isLocked) {
                throw new Error("Please unlock MetaMask first");
            }
            await connectWallet();
        } catch (error) {
            console.error("Connection error:", error);
        } finally {
            setIsPending(false);
        }
    }, [connectWallet, isPending, isConnecting]);

    const handleDisconnect = useCallback(async () => {
        try {
            await disconnectWallet();
        } catch (error) {
            console.error("Disconnect error:", error);
        }
    }, [disconnectWallet]);

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const buttonDisabled = isPending || isConnecting;
    const buttonText = isPending || isConnecting
        ? 'Connecting...'
        : 'Connect Wallet';

    const openEtherscan = () => {
        if (walletAddress) {
            window.open(`https://etherscan.io/address/${walletAddress}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            {error && showError && (
                <div className="fixed top-4 right-4 max-w-md bg-[#2D1B1B] border border-red-900 text-red-400 px-4 py-3 rounded-lg shadow-lg flex justify-between items-center z-50" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setShowError(false)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {!walletAddress ? (
                <button
                    onClick={handleConnect}
                    disabled={buttonDisabled}
                    className={`px-6 py-2.5 bg-gray-800 text-white rounded-lg
                        hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-300 ease-in-out flex items-center gap-3 font-medium ${className}`}
                >
                    <Wallet className="w-5 h-5" />
                    <span>{buttonText}</span>
                    {buttonDisabled && (
                        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                    )}
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <div
                        onClick={openEtherscan}
                        className="px-4 py-2 bg-[#1a1a1a] text-gray-200 rounded-lg border border-gray-800
                            hover:border-purple-900 cursor-pointer transition-all duration-300 flex items-center gap-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-400" />
                            <span>{formatAddress(walletAddress)}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="p-2 bg-[#1a1a1a] text-gray-400 rounded-lg border border-gray-800
                            hover:border-red-900 hover:text-red-400 transition-all duration-300"
                        title="Disconnect Wallet"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletConnect;