export interface ParsedNotification {
  title: string;
  message: string;
}

/**
 * Parses AI restock response into individual notifications
 * Expected format:
 * Urgent low stock items: Onions, iphone 27
 * Recommended restocks:
 * - Onions: order 300 units (current: 100, weekly sales: ?)
 * - iphone 27: order 170 units (current: 600, weekly sales: 580)
 * Summary: restock 2 products, total order quantity 470 units.
 */
export function parseRestockResponse(response: string): ParsedNotification[] {
  const notifications: ParsedNotification[] = [];
  const lines = response.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  let urgentLine: string | null = null;
  const restockItems: string[] = [];
  let summaryLine: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract urgent low stock items
    if (line.toLowerCase().startsWith("urgent low stock items:")) {
      urgentLine = line;
      continue;
    }

    // Extract recommended restocks
    if (line.toLowerCase().startsWith("recommended restocks:")) {
      // Look for bullet points in subsequent lines
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith("-")) {
        restockItems.push(lines[j].substring(1).trim());
        j++;
      }
      i = j - 1;
      continue;
    }

    // Extract summary
    if (line.toLowerCase().startsWith("summary:")) {
      summaryLine = line;
      continue;
    }
  }

  // Create notification for urgent items
  if (urgentLine) {
    const urgentMatch = urgentLine.match(/^Urgent low stock items:\s*(.+)$/i);
    if (urgentMatch && urgentMatch[1].toLowerCase() !== "none") {
      notifications.push({
        title: "Urgent low stock items",
        message: urgentMatch[1].trim(),
      });
    }
  }

  // Create notifications for each restock recommendation
  for (const item of restockItems) {
    // Parse format: "ProductName: order N units (current: C, weekly sales: W)"
    const match = item.match(/^(.+?):\s*order\s+(\d+)\s+units\s*\((.+)\)$/i);
    if (match) {
      const productName = match[1].trim();
      const orderQty = match[2];
      const details = match[3];

      notifications.push({
        title: "Alert Restock",
        message: `${productName}: order ${orderQty} units (${details})`,
      });
    } else {
      // Fallback: use the whole line as message
      notifications.push({
        title: "Alert Restock",
        message: item,
      });
    }
  }

  // Optionally add summary notification (can be skipped if too verbose)
  // if (summaryLine) {
  //   const summaryMatch = summaryLine.match(/^Summary:\s*(.+)$/i);
  //   if (summaryMatch) {
  //     notifications.push({
  //       title: "Restock Summary",
  //       message: summaryMatch[1].trim(),
  //     });
  //   }
  // }

  return notifications;
}
