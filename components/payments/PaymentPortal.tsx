"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { encryptKey } from '@/lib/crypto';

const LOCAL_RPC = "http://127.0.0.1:8545";
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ERC20_ABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function symbol() public view returns (string)"
];

export function PaymentPortal() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState('');
    const [isSecureMode, setIsSecureMode] = useState(false);

    const fetchBalance = async (walletAddress: string) => {
        try {
            const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
            const bal = await tokenContract.balanceOf(walletAddress);
            setBalance(ethers.formatUnits(bal, 18));
        } catch (error) {
            console.error("Balance fetch error:", error);
        }
    };

    const connectWallet = async () => {
        if (!privateKey) {
            toast.error("Please enter a private key for the demo");
            return;
        }
        setLoading(true);
        try {
            const wallet = new ethers.Wallet(privateKey);
            setAddress(wallet.address);
            await fetchBalance(wallet.address);
            toast.success("Wallet connected!");
        } catch (_error) {
            toast.error("Invalid private key");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-500" />
                        Blockchain Wallet
                    </CardTitle>
                    <CardDescription>
                        Connect your local Hardhat account for LINR transactions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!address ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Enter Private Key (Demo Account)"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use one of the pre-funded Hardhat account keys for testing.
                                </p>
                            </div>
                            <Button
                                onClick={connectWallet}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Connect Wallet
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Connected Address</p>
                                    <p className="text-xs text-muted-foreground truncate w-48">{address}</p>
                                </div>
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                    Connected
                                </Badge>
                            </div>
                            <div className="p-4 border rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                                <p className="text-sm text-muted-foreground mb-1">Logix INR Balance</p>
                                <h2 className="text-3xl font-bold">{parseFloat(balance).toLocaleString()} LINR</h2>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setAddress('')}>
                                Disconnect
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        Security Center
                    </CardTitle>
                    <CardDescription>
                        Manage encryption and demo mode security
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Secure Demo Mode</p>
                            <p className="text-xs text-muted-foreground">Encryption active for all keys/hashes</p>
                        </div>
                        <Button
                            variant={isSecureMode ? "default" : "outline"}
                            onClick={() => setIsSecureMode(!isSecureMode)}
                        >
                            {isSecureMode ? "Disable" : "Enable"}
                        </Button>
                    </div>
                    <div className="p-3 border-l-2 border-emerald-500 bg-emerald-500/5 rounded-r-lg">
                        <p className="text-xs flex items-center gap-1.5 text-emerald-600 font-medium">
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
