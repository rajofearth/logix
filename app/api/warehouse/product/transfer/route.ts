import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// Increase timeout for warehouse transactions
export const maxDuration = 30;

// POST /api/warehouse/product/transfer - Transfer product between blocks
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, targetBlockId, quantity } = body;

        if (!productId || !targetBlockId || quantity === undefined || quantity <= 0) {
            return jsonError(
                "Missing required fields: productId, targetBlockId, quantity (must be > 0)",
                400
            );
        }

        // Get source product
        const sourceProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: { block: true },
        });

        if (!sourceProduct) {
            return jsonError("Source product not found", 404);
        }

        if (quantity > sourceProduct.quantity) {
            return jsonError(
                `Cannot transfer ${quantity} units. Only ${sourceProduct.quantity} available.`,
                400
            );
        }

        // Check target block exists
        const targetBlock = await prisma.block.findUnique({
            where: { id: targetBlockId },
        });

        if (!targetBlock) {
            return jsonError("Target block not found", 404);
        }

        // Don't allow transfer to same block
        if (sourceProduct.blockId === targetBlockId) {
            return jsonError("Cannot transfer to the same block", 400);
        }

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Check if product with same SKU exists in target block
            const existingInTarget = await tx.product.findFirst({
                where: {
                    sku: sourceProduct.sku,
                    blockId: targetBlockId,
                },
            });

            if (existingInTarget) {
                // Add quantity to existing product
                await tx.product.update({
                    where: { id: existingInTarget.id },
                    data: { quantity: existingInTarget.quantity + quantity },
                });
            } else {
                // Create new product in target block
                await tx.product.create({
                    data: {
                        sku: `${sourceProduct.sku}-T${Date.now()}`, // Generate unique SKU for transfer
                        name: sourceProduct.name,
                        quantity,
                        category: sourceProduct.category,
                        boughtAt: sourceProduct.boughtAt,
                        currentPrice: sourceProduct.currentPrice,
                        expiryDate: sourceProduct.expiryDate,
                        blockId: targetBlockId,
                    },
                });
            }

            // Reduce source quantity or delete if fully transferred
            if (quantity === sourceProduct.quantity) {
                await tx.product.delete({ where: { id: productId } });
                return { sourceDeleted: true };
            } else {
                await tx.product.update({
                    where: { id: productId },
                    data: { quantity: sourceProduct.quantity - quantity },
                });
                return { sourceDeleted: false };
            }
        });

        return jsonOk({
            success: true,
            message: `Transferred ${quantity} units successfully`,
            ...result,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] POST /api/warehouse/product/transfer error:", msg);
        return jsonError(msg, 500);
    }
}
