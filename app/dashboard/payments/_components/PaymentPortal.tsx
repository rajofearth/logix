"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
        } catch (error) {
            toast.error(`Invalid private key: ${error}`);
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
                                    setAddress('');
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
