"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

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
        <Card className="mt-6 border-blue-500/10 shadow-lg shadow-blue-500/5">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-500" />
                            Logix Explorer
                        </CardTitle>
                        <CardDescription>
                            Real-time local chain transactions
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="animate-pulse flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Block / Hash</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>From/To</TableHead>
                            <TableHead className="text-right"> LINR</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blocks.map((block, bIdx) => (
                            <React.Fragment key={block.hash || `block-${block.number || 'unknown'}-${bIdx}`}>
                                {(block.transactions as TransactionRecord[]).map((tx: TransactionRecord, tIdx: number) => (
                                    <TableRow key={tx.hash || `tx-${block.number || bIdx}-${tIdx}`} className="group transition-colors hover:bg-muted/50">
                                        <TableCell className="font-mono text-xs">
                                            <div className="flex flex-col">
                                                <span className="text-purple-500 font-bold mb-0.5">#{block.number}</span>
                                                <span className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {tx.hash?.substring(0, 10) || '0x...'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-500/5 text-blue-500 text-[10px]">
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
                                            {tx.value != null ? (tx.value === BigInt(0) ? "0.00" : ethers.formatEther(tx.value)) : "0.00"} LINR
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                        {blocks.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No recent transactions found on local chain.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
