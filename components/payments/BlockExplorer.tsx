"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCAL_RPC = "http://127.0.0.1:8545";

interface TransactionRecord {
    hash: string;
    from: string;
    to: string | null;
    value: bigint;
}

interface BlockRecord {
    number: number;
    hash: string | null;
    transactions: (TransactionRecord | string)[];
}

export function BlockExplorer() {
    const [blocks, setBlocks] = useState<BlockRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestBlocks = async () => {
            try {
                const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
                const latestBlock = await provider.getBlockNumber();
                const blockPromises = [];

                for (let i = 0; i < Math.min(5, latestBlock + 1); i++) {
                    blockPromises.push(provider.getBlock(latestBlock - i, true));
                }

                const blockData = await Promise.all(blockPromises);
                setBlocks(blockData.filter(b => b !== null) as unknown as BlockRecord[]);
                const mappedBlocks: BlockRecord[] = blockData
                    .filter((b) => b !== null)
                    .map((block) => ({
                        number: block.number,
                        hash: block.hash,
                        transactions: block.prefetchedTransactions.map((tx) => ({
                            hash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            value: tx.value,
                        })),
                    }));
                setBlocks(mappedBlocks);
            } catch (error) {
                console.error("Explorer fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestBlocks();
        const interval = setInterval(fetchLatestBlocks, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="border-primary/10 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Logix Explorer</CardTitle>
                            <CardDescription>
                                Real-time local chain transactions
                            </CardDescription>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 animate-pulse border-green-500/30"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 absolute" />
                        Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Block / Hash</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>From/To</TableHead>
                                <TableHead className="text-right">LINR</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blocks.map((block, bIdx) => (
                                <React.Fragment key={block.hash || `block-${block.number || 'unknown'}-${bIdx}`}>
                                    {(block.transactions as TransactionRecord[]).map((tx: TransactionRecord, tIdx: number) => (
                                        <TableRow
                                            key={tx.hash || `tx-${block.number || bIdx}-${tIdx}`}
                                            className={cn(
                                                "group hover:bg-muted/50 transition-colors duration-200",
                                                "animate-in fade-in-0 slide-in-from-left-2"
                                            )}
                                            style={{
                                                animationDelay: `${(bIdx * 3 + tIdx) * 50}ms`,
                                                animationFillMode: "backwards",
                                            }}
                                        >
                                            <TableCell className="font-mono text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-primary font-bold mb-0.5">#{block.number}</span>
                                                    <span className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                                                        {tx.hash?.substring(0, 10) || '0x...'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-primary/10 text-primary border-primary/20 text-[10px]"
                                                >
                                                    Contract Call
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px]">
                                                <div className="flex flex-col">
                                                    <span className="text-muted-foreground truncate w-24">F: {tx.from?.substring(0, 8) || '0x...'}</span>
                                                    <span className="text-muted-foreground truncate w-24">T: {tx.to?.substring(0, 8) || '0x...'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-sm">
                                                <span className="text-primary">
                                                    {tx.value != null ? (tx.value === BigInt(0) ? "0.00" : ethers.formatEther(tx.value)) : "0.00"}
                                                </span>
                                                <span className="text-muted-foreground ml-1">LINR</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                            {blocks.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <Activity className="h-8 w-8 text-muted-foreground/50" />
                                            <p className="text-muted-foreground text-sm">
                                                No recent transactions found on local chain.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
