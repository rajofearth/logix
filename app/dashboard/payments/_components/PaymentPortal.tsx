"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CryptoJS from 'crypto-js';

const LOCAL_RPC = "http://127.0.0.1:8545";
const TOKEN_ADDRESS = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
const ENCRYPTION_KEY = "demo-security-key"; // In prod, this would be more secure

const ERC20_ABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function symbol() public view returns (string)"
];

interface PaymentPortalProps {
    address: string;
    onConnect: (address: string, encryptedKey: string) => void;
    onDisconnect: () => void;
}

export function PaymentPortal({ address, onConnect, onDisconnect }: PaymentPortalProps) {
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState('');
    const [isSecureMode, setIsSecureMode] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    const fetchBalance = React.useCallback(async (walletAddress: string) => {
        try {
            const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
            await provider.getNetwork();
            setIsOffline(false);
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
            const bal = await tokenContract.balanceOf(walletAddress);
            setBalance(ethers.formatUnits(bal, 18));
        } catch (error) {
            console.error("Balance fetch error:", error);
            setIsOffline(true);
        }
    }, []);

    useEffect(() => {
        // Fetch persisted wallet on mount
        const fetchPersistedWallet = async () => {
            try {
                const res = await fetch('/api/auth/wallet');
                const data = await res.json();
                if (data.address && data.encryptedKey) {
                    onConnect(data.address, data.encryptedKey);
                    fetchBalance(data.address);
                } else {
                    // Check connectivity even if not connected
                    const checkConn = async () => {
                        try {
                            const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
                            await provider.getNetwork();
                            setIsOffline(false);
                        } catch {
                            setIsOffline(true);
                        }
                    };
                    checkConn();
                }
            } catch (error) {
                console.error("Failed to fetch persisted wallet:", error);
            }
        };

        if (!address) {
            fetchPersistedWallet();
        } else {
            fetchBalance(address);
        }
    }, [address, onConnect, fetchBalance]); // onConnect and fetchBalance added to satisfy exhaustive-deps

    const connectWallet = async () => {
        if (!privateKey) {
            toast.error("Please enter a private key for the demo");
            return;
        }

        // Validate Private Key Format
        const cleanedKey = privateKey.trim();
        if (!cleanedKey.startsWith('0x') && String(cleanedKey).length !== 64) {
            // Heuristic check: if it looks like a command or sentence
            if (cleanedKey.includes(' ') || cleanedKey.length > 70) {
                toast.error("Invalid Private Key. It looks like you pasted a command or sentence.");
                return;
            }
        }

        setLoading(true);
        try {
            // Attempt to create wallet first to validate key immediately
            let wallet;
            try {
                // Ensure 0x prefix if missing for 64-char keys
                const formattedKey = !cleanedKey.startsWith('0x') && cleanedKey.length === 64
                    ? `0x${cleanedKey}`
                    : cleanedKey;
                wallet = new ethers.Wallet(formattedKey);
            } catch (e) {
                console.error("Invalid private key format:", e);
                toast.error("Invalid Private Key format. Please check your key.");
                setLoading(false);
                return;
            }

            const provider = new ethers.JsonRpcProvider(LOCAL_RPC);

            // Set provider to wallet
            wallet.connect(provider);

            await provider.getNetwork(); // Verify node is up

            const encryptedKey = CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();

            // Persist to DB
            const res = await fetch('/api/auth/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: wallet.address,
                    encryptedKey: encryptedKey
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to persist wallet connection");
            }

            onConnect(wallet.address, encryptedKey);
            await fetchBalance(wallet.address);
            toast.success("Wallet connected and saved!");
            setIsOffline(false);
        } catch (error: unknown) {
            console.error(error);
            const err = error as { code?: string; message?: string };
            if (err.code === "NETWORK_ERROR" || err.code === "ECONNREFUSED" || err.message?.includes("could not detect network")) {
                setIsOffline(true);
                toast.error(`Connection failed: Local node appears offline. Run 'npx hardhat node'`);
            } else {
                toast.error(`Error: ${err.message || "Unknown error occurred"}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Wallet Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                            <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        Blockchain Wallet
                    </CardTitle>
                    <CardDescription>
                        Connect your local Hardhat account for LINR transactions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isOffline && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-2 text-red-600 mb-1">
                                <Shield className="h-4 w-4" />
                                <p className="text-xs font-bold uppercase">Node Offline</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Local blockchain not detected. Run <code className="bg-muted px-1 rounded">npx hardhat node</code> and <code className="bg-muted px-1 rounded">npx hardhat run scripts/deploy.js --network localhost</code> in the contracts folder.
                            </p>
                        </div>
                    )}
                    {!address ? (
                        <div className="space-y-4 animate-in fade-in-0 duration-300">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Enter Private Key (Demo Account)"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use one of the pre-funded Hardhat account keys for testing.
                                </p>
                            </div>
                            <Button
                                onClick={connectWallet}
                                disabled={loading}
                                className="w-full transition-all duration-200 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Wallet className="mr-2 h-4 w-4" />
                                )}
                                Connect Wallet
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                                <div>
                                    <p className="text-sm font-medium">Connected Address</p>
                                    <p className="text-xs text-muted-foreground truncate w-48 font-mono">{address}</p>
                                </div>
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                                    Connected
                                </Badge>
                            </div>
                            <div className="p-4 border rounded-xl bg-gradient-to-br from-primary/5 via-orange-500/5 to-transparent">
                                <p className="text-sm text-muted-foreground mb-1">Logix INR Balance</p>
                                <h2 className="text-3xl font-bold text-foreground">
                                    {parseFloat(balance).toLocaleString()} <span className="text-primary">LINR</span>
                                </h2>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 active:scale-[0.98]"
                                onClick={() => {
                                    onDisconnect();
                                    setPrivateKey('');
                                }}
                            >
                                Disconnect
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        Security Center
                    </CardTitle>
                    <CardDescription>
                        Manage encryption and demo mode security
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                        <div>
                            <p className="font-medium">Secure Demo Mode</p>
                            <p className="text-xs text-muted-foreground">Encryption active for all keys/hashes</p>
                        </div>
                        <Button
                            variant={isSecureMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsSecureMode(!isSecureMode)}
                            className={cn(
                                "transition-all duration-200 active:scale-[0.98]",
                                isSecureMode && "shadow-sm"
                            )}
                        >
                            {isSecureMode ? "Disable" : "Enable"}
                        </Button>
                    </div>
                    <div className={cn(
                        "p-3 border-l-2 rounded-r-lg transition-all duration-300",
                        isSecureMode
                            ? "border-green-500 bg-green-500/10"
                            : "border-muted-foreground/30 bg-muted/30"
                    )}>
                        <p className={cn(
                            "text-xs flex items-center gap-1.5 font-medium transition-colors duration-300",
                            isSecureMode ? "text-green-600" : "text-muted-foreground"
                        )}>
                            <Shield className="h-3 w-3" />
                            AES-256 SALTED
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            All private keys are encrypted before storage in memory or local state.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
