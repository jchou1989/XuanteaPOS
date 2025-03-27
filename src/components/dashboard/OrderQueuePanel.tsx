import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Filter, LayoutGrid, Truck, User } from "lucide-react";
import OrderCard from "./OrderCard";
import QRCodeGenerator from "./QRCodeGenerator";
import OrderStatusUpdater from "./OrderStatusUpdater";

type OrderSource = "iPad" | "Talabat" | "Snoonu" | "Deliveroo" | "All";
type OrderStatus = "new" | "processing" | "ready" | "completed" | "All";
type OrderType = "dine-in" | "delivery" | "walk-in" | "All";
type OrderItem = {
  id: string;
  name: string;
  type: "food" | "beverage";
  quantity: number;
  customizations?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    notes?: string;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  source: Exclude<OrderSource, "All">;
  status: Exclude<OrderStatus, "All">;
  items: OrderItem[];
  timestamp: string;
  tableNumber?: string; // Added table number for dine-in orders
  orderType: "dine-in" | "delivery" | "walk-in"; // Added walk-in type
  customerName?: string; // For delivery orders
  customerPhone?: string; // For delivery orders
  deliveryAddress?: string; // For delivery orders
  deviceName?: string; // Device name for iPad orders
};

interface OrderQueuePanelProps {
  orders?: Order[];
  onRefresh?: () => void;
}

// Helper function to format order numbers with appropriate suffixes
const formatOrderNumber = (order: Order): string => {
  // Extract the base number without any existing suffix
  const baseNumber = order.orderNumber.replace(/^#/, "").replace(/-.+$/, "");

  let suffix = "";

  // Add suffix based on order type and source
  if (order.orderType === "walk-in") {
    suffix = "WLK";
  } else if (order.orderType === "delivery") {
    if (order.source === "Talabat") {
      suffix = "TLB";
    } else if (order.source === "Snoonu") {
      suffix = "SNU";
    } else if (order.source === "Deliveroo") {
      suffix = "DLV";
    }
  } else if (order.source === "iPad" && order.deviceName) {
    // Use device name as suffix for iPad orders
    suffix = order.deviceName.substring(0, 3).toUpperCase();
  }

  return `#${baseNumber}-${suffix}`;
};

const OrderQueuePanel = ({
  orders = [],
  onRefresh = () => console.log("Refreshing orders"),
}: OrderQueuePanelProps) => {
  const [sourceFilter, setSourceFilter] = useState<OrderSource>("All");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("All");
  const [typeFilter, setTypeFilter] = useState<OrderType>("All"); // Added type filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showStatusUpdater, setShowStatusUpdater] = useState(false);

  // State to manage orders internally
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  // Listen for new orders and clear orders event
  useEffect(() => {
    // Handler for clearing orders
    const handleClearOrders = () => {
      console.log("Clearing all orders from queue");
      setLocalOrders([]);
    };

    window.addEventListener(
      "clear-orders" as any,
      handleClearOrders as EventListener,
    );

    const handleNewOrder = (event: CustomEvent) => {
      const newOrder = event.detail;
      console.log("Order queue received new order:", newOrder);
      setLocalOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    window.addEventListener(
      "new-order" as any,
      handleNewOrder as EventListener,
    );

    return () => {
      window.removeEventListener(
        "new-order" as any,
        handleNewOrder as EventListener,
      );
      window.removeEventListener(
        "clear-orders" as any,
        handleClearOrders as EventListener,
      );
    };
  }, []);

  // Update local orders when props change
  useEffect(() => {
    if (orders && orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  // Format order numbers with appropriate suffixes
  const formattedOrders = localOrders.map((order) => ({
    ...order,
    displayOrderNumber: formatOrderNumber(order),
  }));

  // Filter orders based on selected filters and search query
  const filteredOrders = formattedOrders.filter((order) => {
    // Filter by source
    if (sourceFilter !== "All" && order.source !== sourceFilter) return false;

    // Filter by status
    if (statusFilter !== "All" && order.status !== statusFilter) return false;

    // Filter by order type
    if (typeFilter !== "All" && order.orderType !== typeFilter) return false;

    // Filter by search query (order number or item names)
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchesOrderNumber = order.orderNumber
        .toLowerCase()
        .includes(lowerCaseQuery);
      const matchesItemName = order.items.some((item) =>
        item.name.toLowerCase().includes(lowerCaseQuery),
      );
      const matchesTableNumber = order.tableNumber
        ? order.tableNumber.toLowerCase().includes(lowerCaseQuery)
        : false;
      const matchesCustomerName = order.customerName
        ? order.customerName.toLowerCase().includes(lowerCaseQuery)
        : false;

      if (
        !matchesOrderNumber &&
        !matchesItemName &&
        !matchesTableNumber &&
        !matchesCustomerName
      )
        return false;
    }

    return true;
  });

  const handleProcessOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusUpdater(true);
  };

  const handleGenerateQR = (order: Order) => {
    setSelectedOrder(order);
    setShowQRGenerator(true);
  };

  const handlePrintLabel = (order: Order) => {
    console.log("Printing label for order:", order.orderNumber);
    // Implement print functionality
  };

  const handleUpdateStatus = (
    order: Order,
    newStatus: Exclude<OrderStatus, "All">,
  ) => {
    console.log(`Updating order ${order.orderNumber} status to ${newStatus}`);
    // Update the order status in the local state
    setLocalOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === order.id ? { ...o, status: newStatus } : o,
      ),
    );

    // Close the status updater dialog
    setShowStatusUpdater(false);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Queue</h2>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders, items, tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select
            value={sourceFilter}
            onValueChange={(value) => setSourceFilter(value as OrderSource)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sources</SelectItem>
              <SelectItem value="iPad">iPad</SelectItem>
              <SelectItem value="Talabat">Talabat</SelectItem>
              <SelectItem value="Snoonu">Snoonu</SelectItem>
              <SelectItem value="Deliveroo">Deliveroo</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as OrderStatus)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as OrderType)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="dine-in">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Dine-in
                </div>
              </SelectItem>
              <SelectItem value="walk-in">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Walk-in
                </div>
              </SelectItem>
              <SelectItem value="delivery">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Order Status Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setStatusFilter("All")}>
            All
            <Badge variant="secondary" className="ml-2">
              {localOrders.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="new" onClick={() => setStatusFilter("new")}>
            New
            <Badge variant="secondary" className="ml-2">
              {localOrders.filter((order) => order.status === "new").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            onClick={() => setStatusFilter("processing")}
          >
            Processing
            <Badge variant="secondary" className="ml-2">
              {
                localOrders.filter((order) => order.status === "processing")
                  .length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" onClick={() => setStatusFilter("ready")}>
            Ready
            <Badge variant="secondary" className="ml-2">
              {localOrders.filter((order) => order.status === "ready").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
            <Badge variant="secondary" className="ml-2">
              {
                localOrders.filter((order) => order.status === "completed")
                  .length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dine-in" onClick={() => setTypeFilter("dine-in")}>
            <LayoutGrid className="h-4 w-4 mr-1" />
            Dine-in
            <Badge variant="secondary" className="ml-2">
              {
                localOrders.filter((order) => order.orderType === "dine-in")
                  .length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="walk-in" onClick={() => setTypeFilter("walk-in")}>
            <User className="h-4 w-4 mr-1" />
            Walk-in
            <Badge variant="secondary" className="ml-2">
              {
                localOrders.filter((order) => order.orderType === "walk-in")
                  .length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="delivery"
            onClick={() => setTypeFilter("delivery")}
          >
            <Truck className="h-4 w-4 mr-1" />
            Delivery
            <Badge variant="secondary" className="ml-2">
              {
                localOrders.filter((order) => order.orderType === "delivery")
                  .length
              }
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No orders found matching your filters
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  id={order.id}
                  orderNumber={order.displayOrderNumber || order.orderNumber}
                  source={order.source}
                  status={order.status}
                  items={order.items}
                  timestamp={order.timestamp}
                  tableNumber={order.tableNumber}
                  orderType={order.orderType}
                  customerName={order.customerName}
                  customerPhone={order.customerPhone}
                  deliveryAddress={order.deliveryAddress}
                  onProcess={() => handleProcessOrder(order)}
                  onGenerateQR={() => handleGenerateQR(order)}
                  onPrintLabel={() => handlePrintLabel(order)}
                  onUpdateStatus={(status) => handleUpdateStatus(order, status)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* These TabsContent components will show the same content as "all" but with pre-filtered status */}
        <TabsContent value="new" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dine-in" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="walk-in" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.displayOrderNumber || order.orderNumber}
                source={order.source}
                status={order.status}
                items={order.items}
                timestamp={order.timestamp}
                tableNumber={order.tableNumber}
                orderType={order.orderType}
                customerName={order.customerName}
                customerPhone={order.customerPhone}
                deliveryAddress={order.deliveryAddress}
                onProcess={() => handleProcessOrder(order)}
                onGenerateQR={() => handleGenerateQR(order)}
                onPrintLabel={() => handlePrintLabel(order)}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Code Generator Dialog */}
      {selectedOrder && (
        <Dialog open={showQRGenerator} onOpenChange={setShowQRGenerator}>
          <DialogContent className="p-0">
            <QRCodeGenerator
              isOpen={showQRGenerator}
              onClose={() => setShowQRGenerator(false)}
              orderDetails={{
                id: selectedOrder.id,
                items: selectedOrder.items.map((item) => ({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  customizations: {
                    size: item.customizations?.size,
                    sugar: item.customizations?.sugarLevel,
                    ice: item.customizations?.iceLevel,
                  },
                })),
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Order Status Updater Dialog */}
      {selectedOrder && (
        <Dialog open={showStatusUpdater} onOpenChange={setShowStatusUpdater}>
          <DialogContent className="p-4">
            <OrderStatusUpdater
              orderId={selectedOrder.orderNumber}
              initialStatus={
                selectedOrder.status === "new"
                  ? "pending"
                  : selectedOrder.status === "processing"
                    ? "preparing"
                    : selectedOrder.status === "ready"
                      ? "ready"
                      : "completed"
              }
              onStatusChange={(status) => {
                // Map the status from OrderStatusUpdater to OrderQueuePanel status format
                const statusMap: Record<string, Exclude<OrderStatus, "All">> = {
                  pending: "new",
                  preparing: "processing",
                  ready: "ready",
                  completed: "completed",
                };
                handleUpdateStatus(selectedOrder, statusMap[status]);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrderQueuePanel;
