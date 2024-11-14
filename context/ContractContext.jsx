"use client"
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import contractABI from '@/artifacts/contracts/Splitwise.sol/Splitwise.json';

const ContractContext = createContext();

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

            // Check if already connected
            const accounts = await window.ethereum.request({
                method: "eth_accounts"
            });

            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setConnectionStatus('connected');
                await initContract();
                return;
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
            await initContract();

        } catch (error) {
            console.error("Connection error:", error);
            if (error.code === -32002) {
                setError("Connection request already pending. Please check MetaMask.");
            } else {
                setError(error.message);
            }
            setConnectionStatus('error');
        } finally {
            setIsConnecting(false);
        }
    }, [isConnecting]);

    const initContract = async () => {
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = "0xd771bF15937fD84FE29BFad2F3Ee9a2480FfeBA6";

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
        // Check initial connection status
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_accounts"
                    });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setConnectionStatus('connected');
                        await initContract();
                    }
                } catch (error) {
                    console.error("Initial connection check failed:", error);
                }
            }
        };

        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    initContract();
                } else {
                    setWalletAddress("");
                    setContract(null);
                    setConnectionStatus('disconnected');
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => { });
                window.ethereum.removeListener('chainChanged', () => { });
            }
        };
    }, []);

    return (
        <ContractContext.Provider
            value={{
                contract,
                walletAddress,
                connectWallet,
                isConnecting,
                connectionStatus,
                error
            }}
        >
            {children}
        </ContractContext.Provider>
    );
}

export function useContract() {
    return useContext(ContractContext);
}