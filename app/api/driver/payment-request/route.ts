import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PaymentRequestDto = {
    id: string;
    amount: number;
    payeeAddress: string;
    payeeName: string | null;
    transactionNote: string | null;
    status: string;
    createdAt: string;
};

type CreatePaymentRequestBody = {
    amount: number;
    payeeAddress: string;
    payeeName?: string;
    transactionNote?: string;
};

/**
 * GET /api/driver/payment-request
 * Returns list of driver's fuel payment requests
 */
export async function GET(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const requests = await prisma.fuelPaymentRequest.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        const dto: PaymentRequestDto[] = requests.map(r => ({
            id: r.id,
            amount: Number(r.amount),
            payeeAddress: r.payeeAddress,
            payeeName: r.payeeName,
            transactionNote: r.transactionNote,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
        }));

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        return jsonError(msg, 500);
    }
}

/**
 * POST /api/driver/payment-request
 * Creates a new fuel payment request from QR scan data
 */
export async function POST(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const body: CreatePaymentRequestBody = await req.json();

        // Validate required fields
        if (!body.amount || body.amount <= 0) {
            return jsonError("Amount must be greater than 0", 400);
        }
        if (!body.payeeAddress || body.payeeAddress.trim() === "") {
            return jsonError("Payee address is required", 400);
        }

        // Check driver has enough balance
        const salaryPayments = await prisma.salaryPayment.findMany({
            where: { driverId },
        });
        const fuelRequests = await prisma.fuelPaymentRequest.findMany({
            where: {
                driverId,
                status: { in: ['pending', 'approved'] }
            },
        });

        const totalEarned = salaryPayments.reduce(
            (sum, p) => sum + Number(p.amount), 0
        );
        const totalSpent = fuelRequests.reduce(
            (sum, r) => sum + Number(r.amount), 0
        );
        const availableBalance = totalEarned - totalSpent;

        if (body.amount > availableBalance) {
            return jsonError(
                `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`,
                400
            );
        }

        // Create the payment request
        const request = await prisma.fuelPaymentRequest.create({
            data: {
                driverId,
                amount: body.amount,
                payeeAddress: body.payeeAddress.trim(),
                payeeName: body.payeeName?.trim() || null,
                transactionNote: body.transactionNote?.trim() || null,
                status: 'pending',
            },
        });

        const dto: PaymentRequestDto = {
            id: request.id,
            amount: Number(request.amount),
            payeeAddress: request.payeeAddress,
            payeeName: request.payeeName,
            transactionNote: request.transactionNote,
            status: request.status,
            createdAt: request.createdAt.toISOString(),
        };

        return jsonOk(dto, { status: 201 });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        return jsonError(msg, 500);
    }
}
