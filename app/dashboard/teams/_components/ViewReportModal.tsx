"use client"

import * as React from "react"
import { IconDownload, IconMessageCircle, IconSend } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import type { Team } from "../_server/teamsData"
import { mockComments } from "../_server/teamsData"

interface ViewReportModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    team: Team | null
}

export function ViewReportModal({ open, onOpenChange, team }: ViewReportModalProps) {
    const [replyContent, setReplyContent] = React.useState("")

    if (!team) return null

    const handleSendReply = () => {
        if (replyContent.trim()) {
            // In real app, this would send the reply
            setReplyContent("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {team.name}
                        <Badge variant="outline" className={
                            team.status === "healthy"
                                ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                                : team.status === "at_risk"
                                    ? "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                                    : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                        }>
                            {team.status === "healthy" ? "Healthy" : team.status === "at_risk" ? "At Risk" : "Overdue"}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Team report and performance overview
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="w-fit">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="comments">
                            Comments
                            <Badge variant="secondary" className="ml-1.5 size-5 px-1">
                                {mockComments.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex-1 overflow-auto mt-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-4">
                                    <div className="text-sm text-muted-foreground">Progress</div>
                                    <div className="text-2xl font-semibold">{team.progress}%</div>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <div className="text-sm text-muted-foreground">Top KPI</div>
                                    <div className="text-2xl font-semibold">{team.topKpi}: {team.kpiValue}</div>
                                </div>
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="text-sm text-muted-foreground mb-2">Summary</div>
                                <p className="text-sm">
                                    The {team.name} team has been performing at {team.progress}% of their target goals.
                                    Their primary KPI ({team.topKpi}) is currently at {team.kpiValue}, which is
                                    {team.status === "healthy" ? " meeting expectations" : team.status === "at_risk" ? " slightly below target" : " significantly below target"}.
                                </p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="text-sm text-muted-foreground mb-2">Team Lead</div>
                                <p className="text-sm font-medium">{team.lead}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="flex-1 overflow-auto mt-4">
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Current</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">{team.topKpi}</TableCell>
                                        <TableCell>{team.kpiValue}</TableCell>
                                        <TableCell>95%</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                team.status === "healthy"
                                                    ? "bg-green-500/10 text-green-600"
                                                    : "bg-yellow-500/10 text-yellow-600"
                                            }>
                                                {team.status === "healthy" ? "On Track" : "Needs Attention"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Overall Progress</TableCell>
                                        <TableCell>{team.progress}%</TableCell>
                                        <TableCell>100%</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                team.progress >= 90
                                                    ? "bg-green-500/10 text-green-600"
                                                    : team.progress >= 70
                                                        ? "bg-yellow-500/10 text-yellow-600"
                                                        : "bg-red-500/10 text-red-600"
                                            }>
                                                {team.progress >= 90 ? "Excellent" : team.progress >= 70 ? "Good" : "Needs Improvement"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Response Time</TableCell>
                                        <TableCell>2.4 hrs</TableCell>
                                        <TableCell>3.0 hrs</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                                On Track
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="comments" className="flex-1 overflow-auto mt-4 flex flex-col">
                        <div className="flex-1 space-y-4 overflow-auto">
                            {mockComments.map((comment) => (
                                <div key={comment.id} className="space-y-3">
                                    <div className="rounded-lg border p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-sm">{comment.author}</span>
                                            <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                    </div>
                                    {comment.replies?.map((reply) => (
                                        <div key={reply.id} className="ml-6 rounded-lg border p-3 bg-muted/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-sm">{reply.author}</span>
                                                <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                                            </div>
                                            <p className="text-sm">{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a comment..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                            />
                            <Button size="icon" onClick={handleSendReply} disabled={!replyContent.trim()}>
                                <IconSend className="size-4" />
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                    <Button variant="outline" disabled>
                        <IconDownload className="size-4" />
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
