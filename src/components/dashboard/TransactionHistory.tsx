import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Printer, FileDown, Search, Calendar } from "lucide-react";
import { getTransactions } from "@/lib/transactionService";
import { format } from "date-fns";

interface TransactionHistoryProps {
  onSelectTransaction?: (transaction: any) => void;
}

const TransactionHistory = ({
  onSelectTransaction,
}: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions(100);
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter transactions based on active tab, search query, and date range
    let filtered = [...transactions];

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter((tx) => tx.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.order_number.toLowerCase().includes(query) ||
          tx.payment_method.toLowerCase().includes(query) ||
          (tx.table_number && tx.table_number.toLowerCase().includes(query)) ||
          tx.order_type.toLowerCase().includes(query),
      );
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(
        (tx) => new Date(tx.created_at) >= dateRange.from!,
      );
    }
    if (dateRange.to) {
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((tx) => new Date(tx.created_at) <= endDate);
    }

    setFilteredTransactions(filtered);
  }, [transactions, activeTab, searchQuery, dateRange]);

  const handlePrintReceipt = (transaction: any) => {
    // Simulate printing receipt
    alert(`Printing receipt for order #${transaction.order_number}`);
  };

  const handleExportTransactions = () => {
    // Export transactions to CSV
    const headers = [
      "Order Number",
      "Date",
      "Amount",
      "Payment Method",
      "Order Type",
      "Table",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((tx) =>
        [
          tx.order_number,
          new Date(tx.created_at).toLocaleString(),
          tx.amount,
          tx.payment_method,
          tx.order_type,
          tx.table_number || "-",
          tx.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "voided":
        return "bg-red-50 text-red-700";
      case "refunded":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return `QAR ${amount.toFixed(2)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and manage past transactions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTransactions}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col">
                <Label htmlFor="from-date" className="text-xs mb-1">
                  From
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="from-date"
                    type="date"
                    className="pl-8 w-[140px]"
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        from: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <Label htmlFor="to-date" className="text-xs mb-1">
                  To
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="to-date"
                    type="date"
                    className="pl-8 w-[140px]"
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        to: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="voided">Voided</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading transactions...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => onSelectTransaction?.(transaction)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          Order #{transaction.order_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), "PPp")} •
                          {transaction.table_number
                            ? ` Table ${transaction.table_number} •`
                            : ""}{" "}
                          {transaction.order_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.payment_method}
                        </p>
                        <p className="font-bold">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    {transaction.items && transaction.items.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {transaction.items
                          .slice(0, 3)
                          .map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.quantity}× {item.name} (
                              {formatCurrency(item.price)})
                            </div>
                          ))}
                        {transaction.items.length > 3 && (
                          <div className="text-xs italic">
                            +{transaction.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintReceipt(transaction);
                        }}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  No transactions found matching your criteria
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
