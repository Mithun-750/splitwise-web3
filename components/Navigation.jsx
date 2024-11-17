"use client"
import Link from 'next/link';
import { useContract } from '@/context/ContractContext';
import WalletConnect from './WalletConnect';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const { walletAddress } = useContract();
    const pathname = usePathname();

    const isActiveLink = (path) => pathname === path;

    return (
        <nav className="bg-[#0A0A0A] border-b border-gray-800 shadow-2xl">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <div className="flex space-x-6">
                        <Link
                            href="/"
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out
                                ${isActiveLink('/') 
                                    ? 'bg-gray-800 text-purple-400 shadow-lg shadow-purple-900/30' 
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-purple-400'}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/expenses"
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out
                                ${isActiveLink('/expenses') 
                                    ? 'bg-gray-800 text-purple-400 shadow-lg shadow-purple-900/30' 
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-purple-400'}`}
                        >
                            Expenses
                        </Link>
                        <Link
                            href="/myexpenses"
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out
                                ${isActiveLink('/myexpenses') 
                                    ? 'bg-gray-800 text-purple-400 shadow-lg shadow-purple-900/30' 
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-purple-400'}`}
                        >
                            My Expenses
                        </Link>
                        <Link
                            href="/rewards"
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out
                                ${isActiveLink('/rewards') 
                                    ? 'bg-gray-800 text-purple-400 shadow-lg shadow-purple-900/30' 
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-purple-400'}`}
                        >
                            Rewards
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <WalletConnect className="bg-gray-800 hover:bg-gray-700 text-purple-400 hover:text-purple-300 transition-colors duration-200 shadow-lg shadow-purple-900/20" />
                    </div>
                </div>
            </div>
        </nav>
    );
}