import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Coffee,
  Utensils,
  Timer,
  ChevronRight,
  Printer,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  type: "beverage" | "food";
  customizations?: string[];
  notes?: string;
  status: "pending" | "preparing" | "ready" | "completed";
  prepTime?: number; // in minutes
}

interface Order {
  id: string;
  orderNumber: string;
  source: "pos" | "talabat" | "snoonu" | "deliveroo";
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: Date;
  table?: string;
  customerName?: string;
  isDelivery: boolean;
  estimatedCompletionTime?: Date;
}

interface KitchenDisplayProps {
  initialOrders?: Order[];
}

const KitchenDisplay = ({ initialOrders = [] }: KitchenDisplayProps) => {
  const [orders, setOrders] = useState<Order[]>(
    initialOrders.length > 0 ? initialOrders : [],
  );

  const [activeTab, setActiveTab] = useState("all");
  const [isPrintingLabels, setIsPrintingLabels] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Listen for new kitchen orders and clear orders event
  useEffect(() => {
    // Handler for clearing kitchen orders
    const handleClearKitchenOrders = () => {
      console.log("Clearing all orders from kitchen display");
      setOrders([]);
    };

    window.addEventListener(
      "clear-kitchen-orders" as any,
      handleClearKitchenOrders as EventListener,
    );

    // Make sure we're listening for kitchen orders
    console.log("Kitchen display setting up event listeners");

    const handleNewKitchenOrder = (event: CustomEvent) => {
      const newOrder = event.detail;
      console.log("Kitchen display received new order:", newOrder);
      console.log("Order items in kitchen display:", newOrder.items);

      // Filter out orders that don't have food items
      if (
        !newOrder.items ||
        !newOrder.items.some((item: any) => item.type === "food")
      ) {
        console.log("Skipping order with no food items:", newOrder.id);
        return;
      }

      // Filter out beverage items from the order
      const orderWithFoodItemsOnly = {
        ...newOrder,
        items: newOrder.items.filter((item: any) => item.type === "food"),
        originalItemCount: newOrder.items.length, // Store original item count for reference
      };

      // Force a re-render by creating a new array
      setOrders((prevOrders) => {
        const updatedOrders = [...prevOrders];
        // Check if order already exists to avoid duplicates
        const existingOrderIndex = updatedOrders.findIndex(
          (order) => order.id === orderWithFoodItemsOnly.id,
        );
        if (existingOrderIndex >= 0) {
          updatedOrders[existingOrderIndex] = orderWithFoodItemsOnly;
        } else {
          updatedOrders.unshift(orderWithFoodItemsOnly); // Add to beginning
        }
        return updatedOrders;
      });
    };

    // Listen for new orders from order queue that contain food items
    const handleNewOrder = (event: CustomEvent) => {
      const newOrder = event.detail;
      console.log(
        "Kitchen display checking new order for food items:",
        newOrder,
      );
      console.log("Order items:", newOrder.items);

      // Only process orders that contain food items
      const foodItems = newOrder.items
        ? newOrder.items.filter((item: any) => item.type === "food")
        : [];

      // Only proceed if there are food items
      if (foodItems.length > 0) {
        // Format the order for kitchen display
        const kitchenOrder = {
          id: newOrder.id || `kitchen-${Date.now()}`,
          orderNumber: newOrder.orderNumber,
          source: newOrder.source || "pos",
          items: foodItems.map((item: any) => ({
            id:
              item.id ||
              `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            quantity: item.quantity,
            type: "food",
            customizations: item.customizations
              ? Object.values(item.customizations).filter(Boolean)
              : [],
            status: "pending",
            prepTime: 8, // Default prep time for food items
          })),
          status: "pending",
          createdAt: new Date(),
          table: newOrder.tableNumber,
          isDelivery: newOrder.orderType === "delivery",
          customerName: newOrder.customerName,
        };

        console.log("Adding food order to kitchen display:", kitchenOrder);
        // Force a re-render by creating a new array
        setOrders((prevOrders) => {
          const updatedOrders = [...prevOrders];
          // Check if order already exists to avoid duplicates
          const existingOrderIndex = updatedOrders.findIndex(
            (order) => order.id === kitchenOrder.id,
          );
          if (existingOrderIndex >= 0) {
            updatedOrders[existingOrderIndex] = kitchenOrder;
          } else {
            updatedOrders.unshift(kitchenOrder); // Add to beginning
          }
          return updatedOrders;
        });
      }
    };

    window.addEventListener(
      "new-kitchen-order" as any,
      handleNewKitchenOrder as EventListener,
    );

    window.addEventListener(
      "new-order" as any,
      handleNewOrder as EventListener,
    );

    return () => {
      window.removeEventListener(
        "new-kitchen-order" as any,
        handleNewKitchenOrder as EventListener,
      );
      window.removeEventListener(
        "new-order" as any,
        handleNewOrder as EventListener,
      );
      window.removeEventListener(
        "clear-kitchen-orders" as any,
        handleClearKitchenOrders as EventListener,
      );
    };
  }, []);

  const updateItemStatus = (
    orderId: string,
    itemId: string,
    newStatus: OrderItem["status"],
  ) => {
    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedItems = order.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, status: newStatus };
            }
            return item;
          });

          // Check if all items are completed
          const allCompleted = updatedItems.every(
            (item) => item.status === "completed",
          );
          const allReady = updatedItems.every(
            (item) => item.status === "ready" || item.status === "completed",
          );

          let newOrderStatus = order.status;
          if (allCompleted) {
            newOrderStatus = "completed";
          } else if (allReady) {
            newOrderStatus = "ready";
          } else if (updatedItems.some((item) => item.status === "preparing")) {
            newOrderStatus = "preparing";
          }

          return {
            ...order,
            items: updatedItems,
            status: newOrderStatus as Order["status"],
          };
        }
        return order;
      });
    });
  };

  const getOrderStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "preparing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Timer className="w-3 h-3 mr-1" /> Preparing
          </Badge>
        );
      case "ready":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Ready
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getItemStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "preparing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Preparing
          </Badge>
        );
      case "ready":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Ready
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSourceBadge = (source: Order["source"]) => {
    switch (source) {
      case "pos":
        return (
          <Badge variant="secondary" className="text-xs">
            In-Store
          </Badge>
        );
      case "talabat":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-orange-100 text-orange-800"
          >
            Talabat
          </Badge>
        );
      case "snoonu":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-purple-100 text-purple-800"
          >
            Snoonu
          </Badge>
        );
      case "deliveroo":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-teal-100 text-teal-800"
          >
            Deliveroo
          </Badge>
        );
      default:
        return null;
    }
  };

  const getItemTypeIcon = (type: OrderItem["type"]) => {
    switch (type) {
      case "beverage":
        return <Coffee className="h-4 w-4 text-blue-500" />;
      case "food":
        return <Utensils className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getTimeElapsed = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    return `${diffMins} minutes ago`;
  };

  const filteredOrders = orders.filter((order) => {
    // First filter by order status tabs
    if (activeTab === "all") {
      return true; // Show all orders
    }
    if (activeTab === "pending") {
      return order.status === "pending";
    }
    if (activeTab === "preparing") {
      return order.status === "preparing";
    }
    if (activeTab === "ready") {
      return order.status === "ready";
    }
    if (activeTab === "completed") {
      return order.status === "completed";
    }
    return true;
  });

  return (
    <div className="container mx-auto py-6">
      {/* Label Printing Dialog */}
      <Dialog open={isPrintingLabels} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Printing Item Labels</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <Printer className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
            <p>Printing labels for food items...</p>
            {printingOrder && (
              <div className="mt-4 text-sm text-left">
                <p className="font-medium">
                  Order #{printingOrder.orderNumber}
                </p>
                <div className="mt-2 space-y-1">
                  {printingOrder.items.map((item, idx) => (
                    <div key={idx} className="border p-2 rounded">
                      <p>
                        {item.quantity}× {item.name}
                      </p>
                      {item.customizations &&
                        item.customizations.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.customizations.join(" • ")}
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <h2 className="text-2xl font-bold">Kitchen Display</h2>
        <p className="text-muted-foreground">
          Manage and track orders in real-time
        </p>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Orders
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Preparing
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Ready
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`overflow-hidden ${order.status === "ready" ? "border-green-500" : ""}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>Order #{order.orderNumber}</CardTitle>
                          {getSourceBadge(order.source)}
                        </div>
                        <CardDescription>
                          {order.isDelivery ? (
                            <span>Delivery for {order.customerName}</span>
                          ) : (
                            <span>{order.table}</span>
                          )}
                        </CardDescription>
                      </div>
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Ordered {getTimeElapsed(order.createdAt)}
                    </div>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-b pb-2 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-start gap-2">
                                {getItemTypeIcon(item.type)}
                                <div>
                                  <div className="font-medium">
                                    {item.quantity}× {item.name}
                                  </div>
                                  {item.customizations &&
                                    item.customizations.length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {item.customizations.join(" • ")}
                                      </div>
                                    )}
                                  {item.notes && (
                                    <div className="text-xs italic mt-1">
                                      Note: {item.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {getItemStatusBadge(item.status)}
                                {item.prepTime && (
                                  <span className="text-xs text-muted-foreground">
                                    ~{item.prepTime} min
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              {item.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateItemStatus(
                                      order.id,
                                      item.id,
                                      "preparing",
                                    )
                                  }
                                >
                                  Start Preparing
                                </Button>
                              )}
                              {item.status === "preparing" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateItemStatus(order.id, item.id, "ready")
                                  }
                                >
                                  Mark Ready
                                </Button>
                              )}
                              {item.status === "ready" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateItemStatus(
                                      order.id,
                                      item.id,
                                      "completed",
                                    )
                                  }
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      Print Ticket
                    </Button>
                    {order.status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          // Print labels for all items
                          setIsPrintingLabels(true);
                          setPrintingOrder(order);

                          // After printing, mark as complete
                          setTimeout(() => {
                            setIsPrintingLabels(false);
                            // Update all items to completed
                            order.items.forEach((item) => {
                              updateItemStatus(order.id, item.id, "completed");
                            });
                            alert(
                              `Labels printed for order #${order.orderNumber}`,
                            );
                          }, 1500);
                        }}
                      >
                        Complete Order <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-40">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KitchenDisplay;
