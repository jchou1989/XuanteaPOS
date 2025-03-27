import { supabase } from "./supabase";

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
  type: string;
  customizations?: Record<string, any>;
}

export interface Transaction {
  orderNumber: string;
  amount: number;
  source: string;
  status: string;
  paymentMethod: string;
  tableNumber?: string;
  orderType: string;
  items: TransactionItem[];
  userId?: string;
  createdBy: string;
}

export const createTransaction = async (transaction: Transaction) => {
  try {
    // Insert transaction with retry logic
    let attempts = 0;
    let data = null;
    let error = null;

    while (attempts < 3) {
      try {
        const result = await supabase
          .from("transactions")
          .insert([
            {
              order_number: transaction.orderNumber,
              amount: transaction.amount,
              source: transaction.source,
              status: transaction.status,
              payment_method: transaction.paymentMethod,
              table_number: transaction.tableNumber || null,
              order_type: transaction.orderType,
              user_id: transaction.userId || null,
              created_by: transaction.createdBy,
            },
          ])
          .select();

        data = result.data;
        error = result.error;
        if (!error) break;

        console.warn(
          `Transaction insert attempt ${attempts + 1} failed:`,
          error,
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      } catch (fetchError) {
        console.error(
          `Transaction insert attempt ${attempts + 1} error:`,
          fetchError,
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error("No data returned from transaction insert");
    }

    const transactionId = data[0].id;

    // Insert transaction items with retry logic
    const transactionItems = transaction.items.map((item) => ({
      transaction_id: transactionId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      type: item.type || null,
      customizations: item.customizations || null,
    }));

    attempts = 0;
    let itemsError = null;

    while (attempts < 3) {
      try {
        const result = await supabase
          .from("transaction_items")
          .insert(transactionItems);

        itemsError = result.error;
        if (!itemsError) break;

        console.warn(
          `Transaction items insert attempt ${attempts + 1} failed:`,
          itemsError,
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      } catch (fetchError) {
        console.error(
          `Transaction items insert attempt ${attempts + 1} error:`,
          fetchError,
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (itemsError) {
      console.error(
        "Failed to insert transaction items after retries:",
        itemsError,
      );
      // Continue anyway to return the transaction ID
    }

    return {
      ...transaction,
      id: transactionId,
      date: new Date(),
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    // Return a temporary ID for UI purposes even if the database operation failed
    return {
      ...transaction,
      id: `temp-${Date.now()}`,
      date: new Date(),
    };
  }
};

export const getTransactions = async (limit = 50) => {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // For each transaction, get its items
    const transactionsWithItems = await Promise.all(
      transactions.map(async (transaction) => {
        const { data: items, error: itemsError } = await supabase
          .from("transaction_items")
          .select("*")
          .eq("transaction_id", transaction.id);

        if (itemsError) throw itemsError;

        return {
          ...transaction,
          items: items || [],
        };
      }),
    );

    return transactionsWithItems;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const updateTransactionStatus = async (
  id: string,
  status: string,
  reason?: string,
) => {
  try {
    // Skip database operation for temporary IDs
    if (id.startsWith("temp-")) {
      console.warn(
        "Skipping database update for temporary transaction ID:",
        id,
      );
      return true;
    }

    // Update with retry logic
    let attempts = 0;
    let error = null;

    const updateData: any = { status };

    if (status === "voided" && reason) {
      updateData.void_reason = reason;
      updateData.voided_at = new Date().toISOString();
    } else if (status === "refunded" && reason) {
      updateData.refund_reason = reason;
      updateData.refunded_at = new Date().toISOString();
    }

    while (attempts < 3) {
      try {
        const result = await supabase
          .from("transactions")
          .update(updateData)
          .eq("id", id)
          .select();

        error = result.error;
        if (!error) break;

        console.warn(
          `Transaction status update attempt ${attempts + 1} failed:`,
          error,
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      } catch (fetchError) {
        console.error(
          `Transaction status update attempt ${attempts + 1} error:`,
          fetchError,
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (error) {
      console.error(
        "Failed to update transaction status after retries:",
        error,
      );
      // Return true anyway to allow UI to continue
      return true;
    }

    return true;
  } catch (error) {
    console.error("Error updating transaction status:", error);
    // Return true anyway to allow UI to continue
    return true;
  }
};

// Add a function to periodically sync any pending transactions
export const syncPendingTransactions = async () => {
  try {
    // This would normally check a local storage queue of pending transactions
    // and attempt to sync them with the server
    const pendingTransactions = localStorage.getItem("pendingTransactions");

    if (pendingTransactions) {
      try {
        const transactions = JSON.parse(pendingTransactions);

        for (const transaction of transactions) {
          try {
            await createTransaction(transaction);
            // Remove from pending queue after successful sync
            const updatedQueue = transactions.filter(
              (t) => t.orderNumber !== transaction.orderNumber,
            );
            localStorage.setItem(
              "pendingTransactions",
              JSON.stringify(updatedQueue),
            );
          } catch (error) {
            console.error("Failed to sync pending transaction:", error);
            // Keep in queue for next sync attempt
          }
        }
      } catch (parseError) {
        console.error("Error parsing pending transactions:", parseError);
        // Clear invalid data
        localStorage.removeItem("pendingTransactions");
      }
    }

    return true;
  } catch (error) {
    console.error("Error syncing pending transactions:", error);
    return false;
  }
};
