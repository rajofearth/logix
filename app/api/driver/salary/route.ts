import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TransactionType = "salary" | "fuel_request" | "delivery";

type Transaction = {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    status: string;
    createdAt: string;
    isCredit: boolean;
};

type DriverSalaryDto = {
    baseSalary: number;
    availableBalance: number; // Total salary paid minus approved fuel requests
    monthlyEarnings: number; // This month's salary payments
    deliveryCount: number; // Completed deliveries this month
    recentTransactions: Transaction[];
};

/**
 * GET /api/driver/salary
 * Returns driver-specific salary and earnings data
 */
export async function GET(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
            select: {
                baseSalary: true,
            },
        });

        if (!driver) {
            return jsonError("Driver not found", 404);
        }

        // Get the start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get salary payments for this driver
        const salaryPayments = await prisma.salaryPayment.findMany({
            where: { driverId },
            orderBy: { paidAt: 'desc' },
            take: 10,
        });

        // Get this month's salary payments
        const monthlyPayments = salaryPayments.filter(
            p => new Date(p.paidAt) >= startOfMonth
        );
        const monthlyEarnings = monthlyPayments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
        );

        // Get fuel payment requests
        const fuelRequests = await prisma.fuelPaymentRequest.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Calculate available balance: total salary received - approved fuel requests
        const totalSalaryReceived = salaryPayments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
        );
        const totalApprovedFuel = fuelRequests
            .filter(r => r.status === 'approved')
            .reduce((sum, r) => sum + Number(r.amount), 0);
        const pendingFuel = fuelRequests
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + Number(r.amount), 0);

        const availableBalance = totalSalaryReceived - totalApprovedFuel - pendingFuel;

        // Get delivery count this month
        const deliveryCount = await prisma.job.count({
            where: {
                driverId,
                status: 'completed',
                updatedAt: { gte: startOfMonth },
            },
        });

        // Build transaction list (combine salary payments and fuel requests)
        const transactions: Transaction[] = [];

        for (const payment of salaryPayments) {
            transactions.push({
                id: payment.id,
                title: `Salary Payment`,
                amount: Number(payment.amount),
                type: 'salary',
                status: payment.status,
                createdAt: payment.paidAt.toISOString(),
                isCredit: true,
            });
        }

        for (const request of fuelRequests) {
            transactions.push({
                id: request.id,
                title: request.payeeName || 'Fuel Payment',
                amount: Number(request.amount),
                type: 'fuel_request',
                status: request.status,
                createdAt: request.createdAt.toISOString(),
                isCredit: false,
            });
        }

        // Sort by date descending
        transactions.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const dto: DriverSalaryDto = {
            baseSalary: Number(driver.baseSalary),
            availableBalance: Math.max(0, availableBalance),
            monthlyEarnings,
            deliveryCount,
            recentTransactions: transactions.slice(0, 10),
        };

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        return jsonError(msg, 500);
    }
}
