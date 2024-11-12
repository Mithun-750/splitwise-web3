"use client"
import Link from 'next/link';
import { useContract } from '@/context/ContractContext';
import WalletConnect from './WalletConnect';

export default function Navigation() {
    const { walletAddress } = useContract();

    return (
        <nav className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex space-x-4">
                        <Link
                            href="/"
                            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                        >
                            Home
                        </Link>
                        <Link
                            href="/expenses"
                            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                        >
                            Expenses
                        </Link>
                        <Link
                            href="/myexpenses"
                            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                        >
                            Expenses by You
                        </Link>
                    </div>
                    <div className="text-sm truncate">
                        {/* {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected'} */}
                        <WalletConnect className="bg-purple-500 hover:bg-purple-600" />
                    </div>
                </div>
            </div>
        </nav>
    );
}