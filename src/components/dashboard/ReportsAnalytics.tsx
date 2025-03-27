import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { Badge } from "../ui/badge";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

interface SalesData {
  period: string;
  amount: number;
}

interface OrderSourceData {
  source: string;
  count: number;
  percentage: number;
}

interface PopularItemData {
  name: string;
  quantity: number;
  revenue: number;
}

interface Transaction {
  id: string;
  orderNumber: string;
  date: Date;
  amount: number;
  source: string;
  status: "completed" | "refunded" | "voided" | "pending";
  paymentMethod?: string;
  items: { name: string; quantity: number; price: number }[];
  tableNumber?: string;
  orderType?: string;
  customerName?: string;
}

interface ReportsAnalyticsProps {
  salesData?: SalesData[];
  orderSourceData?: OrderSourceData[];
  popularItems?: PopularItemData[];
  transactions?: Transaction[];
}

const ReportsAnalytics = ({
  salesData: initialSalesData = [],
  orderSourceData: initialOrderSourceData = [],
  popularItems: initialPopularItems = [],
  transactions: initialTransactions = [],
}: ReportsAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [activeTab, setActiveTab] = useState("sales");
  const [allTransactions, setAllTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [salesData, setSalesData] = useState<SalesData[]>(initialSalesData);
  const [orderSourceData, setOrderSourceData] = useState<OrderSourceData[]>(
    initialOrderSourceData,
  );
  const [popularItems, setPopularItems] =
    useState<PopularItemData[]>(initialPopularItems);

  // Process transaction data to generate reports
  const processTransactionData = (transactions: Transaction[]) => {
    if (transactions.length === 0) return;

    // Process sales data
    const salesByDay = new Map<string, number>();
    const now = new Date();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize with zero values for all days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = daysOfWeek[date.getDay()];
      salesByDay.set(dayName, 0);
    }

    // Add transaction amounts to the appropriate day
    transactions.forEach((transaction) => {
      if (transaction.status === "completed") {
        const transactionDate = new Date(transaction.date);
        const dayName = daysOfWeek[transactionDate.getDay()];
        if (salesByDay.has(dayName)) {
          salesByDay.set(
            dayName,
            (salesByDay.get(dayName) || 0) + transaction.amount,
          );
        }
      }
    });

    // Convert to array format for chart
    const newSalesData: SalesData[] = Array.from(salesByDay.entries()).map(
      ([period, amount]) => ({
        period,
        amount,
      }),
    );
    setSalesData(newSalesData);

    // Process order source data
    const sourceCount = new Map<string, number>();
    let totalOrders = 0;

    transactions.forEach((transaction) => {
      const source =
        transaction.source === "pos"
          ? "In-store"
          : transaction.source === "talabat"
            ? "Talabat"
            : transaction.source === "snoonu"
              ? "Snoonu"
              : transaction.source === "deliveroo"
                ? "Deliveroo"
                : "Other";

      sourceCount.set(source, (sourceCount.get(source) || 0) + 1);
      totalOrders++;
    });

    const newOrderSourceData: OrderSourceData[] = Array.from(
      sourceCount.entries(),
    )
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalOrders) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    setOrderSourceData(newOrderSourceData);

    // Process popular items
    const itemSales = new Map<string, { quantity: number; revenue: number }>();

    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existing = itemSales.get(item.name) || {
          quantity: 0,
          revenue: 0,
        };
        itemSales.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price * item.quantity,
        });
      });
    });

    const newPopularItems: PopularItemData[] = Array.from(itemSales.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setPopularItems(newPopularItems);
  };

  // Listen for new transactions
  useEffect(() => {
    const handleNewTransaction = (event: CustomEvent) => {
      const newTransaction = event.detail;
      console.log("Analytics received new transaction:", newTransaction);
      setAllTransactions((prev) => [newTransaction, ...prev]);
    };

    window.addEventListener(
      "new-analytics-transaction" as any,
      handleNewTransaction as EventListener,
    );

    return () => {
      window.removeEventListener(
        "new-analytics-transaction" as any,
        handleNewTransaction as EventListener,
      );
    };
  }, []);

  // Load transaction data
  useEffect(() => {
    // We'll rely on real transaction data instead of sample data
    if (allTransactions.length) {
      processTransactionData(allTransactions);
    }
  }, [allTransactions]);

  return (
    <div className="w-full h-full p-6 bg-background overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Sales Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Order Sources
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Popular Items
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                View your sales performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                {/* Sales chart would go here - using placeholder */}
                <div className="w-full h-full bg-gray-50 rounded-lg flex flex-col">
                  <div className="flex justify-between px-4 pt-4">
                    {salesData.length > 0 ? (
                      salesData.map((item, index) => {
                        const maxAmount = Math.max(
                          ...salesData.map((d) => d.amount),
                        );
                        const height =
                          maxAmount > 0 ? (item.amount / maxAmount) * 200 : 0;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div
                              className="w-12 bg-primary rounded-t-sm"
                              style={{ height: `${height}px` }}
                            />
                            <span className="text-xs mt-2">{item.period}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No sales data available
                      </div>
                    )}
                  </div>
                  <div className="mt-auto p-4 text-center text-sm text-muted-foreground">
                    Sales chart visualization
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Total Sales
                    </div>
                    <div className="text-2xl font-bold">
                      QAR{" "}
                      {allTransactions
                        .filter((t) => t.status === "completed")
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toFixed(2)}
                    </div>
                    <div className="text-xs text-green-500">
                      {allTransactions.length > 0
                        ? "+New orders"
                        : "No orders yet"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Total Orders
                    </div>
                    <div className="text-2xl font-bold">
                      {allTransactions.length}
                    </div>
                    <div className="text-xs text-green-500">
                      {allTransactions.length > 0
                        ? "+New orders"
                        : "No orders yet"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Avg. Order Value
                    </div>
                    <div className="text-2xl font-bold">
                      QAR{" "}
                      {allTransactions.length > 0
                        ? (
                            allTransactions.reduce(
                              (sum, t) => sum + t.amount,
                              0,
                            ) / allTransactions.length
                          ).toFixed(2)
                        : "0.00"}
                    </div>
                    <div className="text-xs text-green-500">
                      {allTransactions.length > 0
                        ? "Based on real orders"
                        : "No orders yet"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Sources</CardTitle>
              <CardDescription>
                Distribution of orders by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                <div className="h-[300px] w-[300px] relative">
                  {/* Pie chart would go here - using placeholder */}
                  <div className="w-full h-full rounded-full border-8 border-primary relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {allTransactions.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Orders
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-4">
                    {orderSourceData.length > 0 ? (
                      orderSourceData.map((source, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div
                            className={`w-4 h-4 rounded-full bg-primary opacity-${100 - index * 20}`}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {source.source}
                              </span>
                              <span className="text-muted-foreground">
                                {source.count} orders
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${source.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {source.percentage}%
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        No order source data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
              <CardDescription>
                Best-selling products by quantity and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                {popularItems.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Item Name</th>
                        <th className="px-6 py-3">Quantity Sold</th>
                        <th className="px-6 py-3">Revenue</th>
                        <th className="px-6 py-3">% of Total Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popularItems.map((item, index) => {
                        const totalRevenue = popularItems.reduce(
                          (sum, item) => sum + item.revenue,
                          0,
                        );
                        const percentage =
                          totalRevenue > 0
                            ? ((item.revenue / totalRevenue) * 100).toFixed(1)
                            : "0.0";

                        return (
                          <tr key={index} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium">
                              {item.name}
                            </td>
                            <td className="px-6 py-4">{item.quantity}</td>
                            <td className="px-6 py-4">
                              QAR {item.revenue.toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-full h-2 bg-gray-100 rounded-full">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span>{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No popular items data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete record of all transactions for refunds and auditing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                {allTransactions.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Order #</th>
                        <th className="px-6 py-3">Date & Time</th>
                        <th className="px-6 py-3">Source</th>
                        <th className="px-6 py-3">Payment Method</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTransactions.map((transaction) => (
                        <tr key={transaction.id} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">
                            {transaction.orderNumber}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(transaction.date).toLocaleDateString()}{" "}
                            {new Date(transaction.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.source === "pos" && "In-store"}
                            {transaction.source === "talabat" && "Talabat"}
                            {transaction.source === "snoonu" && "Snoonu"}
                            {transaction.source === "deliveroo" && "Deliveroo"}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.paymentMethod || "Cash"}
                          </td>
                          <td className="px-6 py-4">
                            QAR {transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={`
                                ${transaction.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : ""}
                                ${transaction.status === "refunded" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                                ${transaction.status === "voided" ? "bg-red-50 text-red-700 border-red-200" : ""}
                                ${transaction.status === "pending" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                              `}
                            >
                              {transaction.status.charAt(0).toUpperCase() +
                                transaction.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {transaction.items.map((item, idx) => (
                                <div key={idx} className="text-xs">
                                  {item.quantity}× {item.name} (QAR{" "}
                                  {item.price.toFixed(2)})
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No transaction history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
