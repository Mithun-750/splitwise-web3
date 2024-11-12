"use client"
import React, { useState, useCallback } from 'react';
import { useContract } from '@/context/ContractContext';
import { X } from 'lucide-react';

const WalletConnect = ({ className = "" }) => {
    const { connectWallet, isConnecting, walletAddress, error } = useContract();
    const [isPending, setIsPending] = useState(false);
    const [showError, setShowError] = useState(true);

    const handleConnect = useCallback(async () => {
        if (isPending || isConnecting) return; // Prevent multiple requests
        setShowError(true); // Reset error visibility on new connection attempt

        try {
            setIsPending(true);
            // Check if there's already a pending request
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

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Determine button state
    const buttonDisabled = isPending || isConnecting;
    const buttonText = isPending || isConnecting
        ? 'Connecting...'
        : walletAddress
            ? `Connected: ${formatAddress(walletAddress)}`
            : 'Connect Wallet';

    return (
        <div className="flex flex-col items-start gap-2">
            {error && showError && (
                <div className="fixed top-0 left-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full flex justify-between items-center" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setShowError(false)}
                        className="text-red-700 hover:text-red-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {!walletAddress && (<button
                onClick={handleConnect}
                disabled={buttonDisabled}
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50
                    transition-all duration-200 ease-in-out flex items-center gap-2 ${className}`}
            >
                <span>{buttonText}</span>
                <span className={`h-2 w-2 rounded-full ${buttonDisabled
                    ? 'bg-yellow-400 animate-pulse'
                    : walletAddress
                        ? 'bg-green-400'
                        : 'bg-red-400'
                    }`} />
            </button>)}

            {walletAddress && (
                <div className="px-4 py-2 bg-blue-500 text-white rounded  disabled:opacity-50
                    transition-all duration-200 ease-in-out flex items-center gap-2">
                    Connected to {walletAddress}
                </div>
            )}
        </div>
    );
};

export default WalletConnect;