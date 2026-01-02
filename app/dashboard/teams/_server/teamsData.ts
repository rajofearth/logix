// Teams mock data and types

export type TeamStatus = "healthy" | "at_risk" | "overdue"
export type Department = "fleet" | "operations" | "warehouse" | "maintenance"

export interface Team {
    id: string
    name: string
    progress: number
    topKpi: string
    kpiValue: string
    status: TeamStatus
    lastReportDate: string
    lead: string
    department: Department
}

export interface TeamAlert {
    id: string
    teamId: string
    teamName: string
    message: string
    severity: "warning" | "critical"
    createdAt: string
}

export interface TeamComment {
    id: string
    author: string
    content: string
    createdAt: string
    replies?: TeamComment[]
}

export const mockTeams: Team[] = [
    {
        id: "team-1",
        name: "Fleet Management",
        progress: 92,
        topKpi: "On-Time",
        kpiValue: "95%",
        status: "healthy",
        lastReportDate: "2 hours ago",
        lead: "John Smith",
        department: "fleet",
    },
    {
        id: "team-2",
        name: "Operations Team",
        progress: 78,
        topKpi: "Tasks",
        kpiValue: "85%",
        status: "at_risk",
        lastReportDate: "1 day ago",
        lead: "Sarah Johnson",
        department: "operations",
    },
    {
        id: "team-3",
        name: "Warehouse Ops",
        progress: 100,
        topKpi: "Accuracy",
        kpiValue: "98%",
        status: "healthy",
        lastReportDate: "3 days ago",
        lead: "Mike Chen",
        department: "warehouse",
    },
    {
        id: "team-4",
        name: "Maintenance Crew",
        progress: 65,
        topKpi: "Downtime",
        kpiValue: "12%",
        status: "overdue",
        lastReportDate: "5 days ago",
        lead: "Emily Davis",
        department: "maintenance",
    },
]

export const mockAlerts: TeamAlert[] = [
    {
        id: "alert-1",
        teamId: "team-2",
        teamName: "Ops Team",
        message: "Delay Spike",
        severity: "critical",
        createdAt: "10 minutes ago",
    },
    {
        id: "alert-2",
        teamId: "team-4",
        teamName: "Maintenance Crew",
        message: "Overdue Report",
        severity: "warning",
        createdAt: "2 hours ago",
    },
]

// 30-day progress trend data for chart (Apr-Jun)
export const trendChartData = [
    { date: "Apr 1", progress: 70 },
    { date: "Apr 8", progress: 72 },
    { date: "Apr 15", progress: 75 },
    { date: "Apr 22", progress: 78 },
    { date: "Apr 29", progress: 80 },
    { date: "May 6", progress: 79 },
    { date: "May 13", progress: 82 },
    { date: "May 20", progress: 85 },
    { date: "May 27", progress: 88 },
    { date: "Jun 3", progress: 90 },
    { date: "Jun 10", progress: 92 },
]

export const mockComments: TeamComment[] = [
    {
        id: "comment-1",
        author: "John Smith",
        content: "Great progress this week! Let's keep it up.",
        createdAt: "2 hours ago",
        replies: [
            {
                id: "reply-1",
                author: "Sarah Johnson",
                content: "@John agreed, the team has been fantastic.",
                createdAt: "1 hour ago",
            },
        ],
    },
    {
        id: "comment-2",
        author: "Mike Chen",
        content: "We need to address the delivery delays ASAP.",
        createdAt: "1 day ago",
    },
]

export const kpiOptions = [
    { value: "on_time", label: "On-Time Delays" },
    { value: "task_completion", label: "Task Completion" },
    { value: "accuracy", label: "Accuracy" },
    { value: "downtime", label: "Downtime" },
]

export const departmentOptions = [
    { value: "all", label: "All Teams" },
    { value: "fleet", label: "Fleet" },
    { value: "operations", label: "Ops" },
    { value: "warehouse", label: "Warehouse" },
    { value: "maintenance", label: "Maintenance" },
]

export const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "healthy", label: "Healthy" },
    { value: "at_risk", label: "At Risk" },
    { value: "overdue", label: "Overdue" },
]
