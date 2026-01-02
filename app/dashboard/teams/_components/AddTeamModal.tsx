"use client"

import * as React from "react"

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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { kpiOptions } from "../_server/teamsData"

interface AddTeamModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: { name: string; description: string; kpi: string }) => void
}

export function AddTeamModal({ open, onOpenChange, onSubmit }: AddTeamModalProps) {
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [kpi, setKpi] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name && kpi) {
            onSubmit({ name, description, kpi })
            setName("")
            setDescription("")
            setKpi("")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Team</DialogTitle>
                    <DialogDescription>
                        Create a new team to track their progress and KPIs.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                            id="team-name"
                            placeholder="Enter team name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="team-description">Description</Label>
                        <Textarea
                            id="team-description"
                            placeholder="Describe the team's responsibilities"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="team-kpi">Primary KPI</Label>
                        <Select value={kpi} onValueChange={setKpi} required>
                            <SelectTrigger id="team-kpi">
                                <SelectValue placeholder="Select a KPI" />
                            </SelectTrigger>
                            <SelectContent>
                                {kpiOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name || !kpi}>
                            Create Team
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
