"use client"
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import contractABI from '@/artifacts/contracts/Splitwise.sol/Splitwise.json';

const ContractContext = createContext();

const STORAGE_KEY = 'walletConnectionState';

export function ContractProvider({ children }) {
    const [contract, setContract] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const connectWallet = useCallback(async () => {
        if (isConnecting) return;

        setIsConnecting(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error("Please install MetaMask to use this application");
            }

            // If not connected, request connection
            const newAccounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (!newAccounts || newAccounts.length === 0) {
                throw new Error("No accounts found. Please connect to MetaMask.");
            }

            setWalletAddress(newAccounts[0]);
            setConnectionStatus('connected');
            localStorage.setItem(STORAGE_KEY, 'connected');
            await initContract();

        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError(error.message || "Failed to connect wallet");
            setConnectionStatus('error');
            localStorage.setItem(STORAGE_KEY, 'disconnected');
        } finally {
            setIsConnecting(false);
        }
    }, [isConnecting]);

    const disconnectWallet = useCallback(async () => {
        setContract(null);
        setWalletAddress("");
        setConnectionStatus('disconnected');
        localStorage.setItem(STORAGE_KEY, 'disconnected');
    }, []);

    const initContract = async () => {
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = "0xeB72267186E3A99AA458a0c41E2Ba7E05DfDb8D7";

            const deployedContract = new Contract(
                contractAddress,
                contractABI.abi,
                signer
            );

            setContract(deployedContract);
        } catch (error) {
            console.error("Contract initialization error:", error);
            setError("Failed to initialize contract. Please try again.");
            setConnectionStatus('error');
        }
    };

    useEffect(() => {
        const checkConnection = async () => {
            const savedConnectionState = localStorage.getItem(STORAGE_KEY);
            
            // Only auto-connect if previously connected
            if (savedConnectionState === 'connected' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_accounts"
                    });

                    if (accounts && accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setConnectionStatus('connected');
                        await initContract();
                    } else {
                        // If no accounts found, ensure we're in disconnected state
                        await disconnectWallet();
                    }
                } catch (error) {
                    console.error("Error checking connection:", error);
                    await disconnectWallet();
                }
            }
        };

        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length === 0) {
                    await disconnectWallet();
                } else {
                    setWalletAddress(accounts[0]);
                    setConnectionStatus('connected');
                    localStorage.setItem(STORAGE_KEY, 'connected');
                    await initContract();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', disconnectWallet);
                window.ethereum.removeListener('chainChanged', () => {
                    window.location.reload();
                });
            }
        };
    }, [disconnectWallet]);

    return (
        <ContractContext.Provider
            value={{
                contract,
                walletAddress,
                isConnecting,
                error,
                connectWallet,
                disconnectWallet,
                connectionStatus
            }}
        >
            {children}
        </ContractContext.Provider>
    );
}

export function useContract() {
    return useContext(ContractContext);
}