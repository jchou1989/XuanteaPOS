import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SampleOrdersGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [numOrders, setNumOrders] = useState("5");
  const [includeFood, setIncludeFood] = useState(true);
  const [includeBeverages, setIncludeBeverages] = useState(true);
  const [orderSource, setOrderSource] = useState<string>("mixed");
  const [isGenerating, setIsGenerating] = useState(false);

  const foodItems = [
    {
      id: "f1",
      name: "Margherita Pizza",
      price: 45,
      type: "food",
      category: "Pizza",
    },
    {
      id: "f2",
      name: "Pepperoni Pizza",
      price: 55,
      type: "food",
      category: "Pizza",
    },
    {
      id: "f3",
      name: "Chicken Alfredo Pasta",
      price: 48,
      type: "food",
      category: "Pasta",
    },
    {
      id: "f4",
      name: "Caesar Salad",
      price: 35,
      type: "food",
      category: "Salad",
    },
    {
      id: "f5",
      name: "Garlic Bread",
      price: 15,
      type: "food",
      category: "Appetizers",
    },
    {
      id: "f6",
      name: "Beef Burger",
      price: 42,
      type: "food",
      category: "Burgers",
    },
    {
      id: "f7",
      name: "Chicken Wings",
      price: 38,
      type: "food",
      category: "Appetizers",
    },
    {
      id: "f8",
      name: "Seafood Risotto",
      price: 65,
      type: "food",
      category: "Mains",
    },
  ];

  const beverageItems = [
    {
      id: "b1",
      name: "Jasmine Tea",
      price: 18,
      type: "beverage",
      category: "Tea",
    },
    {
      id: "b2",
      name: "Oolong Tea",
      price: 20,
      type: "beverage",
      category: "Tea",
    },
    {
      id: "b3",
      name: "Green Tea Latte",
      price: 22,
      type: "beverage",
      category: "Tea",
    },
    {
      id: "b4",
      name: "Bubble Milk Tea",
      price: 25,
      type: "beverage",
      category: "Tea",
    },
    {
      id: "b5",
      name: "Espresso",
      price: 15,
      type: "beverage",
      category: "Coffee",
    },
    {
      id: "b6",
      name: "Cappuccino",
      price: 18,
      type: "beverage",
      category: "Coffee",
    },
    {
      id: "b7",
      name: "Fresh Orange Juice",
      price: 20,
      type: "beverage",
      category: "Juice",
    },
    {
      id: "b8",
      name: "Lemonade",
      price: 18,
      type: "beverage",
      category: "Juice",
    },
  ];

  const getRandomItems = (count: number) => {
    const items = [];
    const availableItems = [];

    if (includeFood) availableItems.push(...foodItems);
    if (includeBeverages) availableItems.push(...beverageItems);

    if (availableItems.length === 0) return [];

    const itemCount = Math.min(
      Math.max(1, Math.floor(Math.random() * count)),
      availableItems.length,
    );

    for (let i = 0; i < itemCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const item = availableItems[randomIndex];
      const quantity = Math.floor(Math.random() * 3) + 1;

      items.push({
        id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        type: item.type,
        quantity: quantity,
        customizations:
          item.type === "beverage"
            ? {
                size: ["Small", "Medium", "Large"][
                  Math.floor(Math.random() * 3)
                ],
                sugarLevel: ["No Sugar", "25%", "50%", "75%", "100%"][
                  Math.floor(Math.random() * 5)
                ],
                iceLevel: ["No Ice", "Less Ice", "Regular Ice", "Extra Ice"][
                  Math.floor(Math.random() * 4)
                ],
              }
            : undefined,
      });

      // Remove the selected item to avoid duplicates
      availableItems.splice(randomIndex, 1);
    }

    return items;
  };

  const getRandomSource = () => {
    if (orderSource === "mixed") {
      const sources = ["iPad", "Talabat", "Snoonu", "Deliveroo"];
      return sources[Math.floor(Math.random() * sources.length)];
    }
    return orderSource;
  };

  const getRandomOrderType = (source: string) => {
    if (source === "iPad") {
      return Math.random() > 0.5 ? "dine-in" : "walk-in";
    } else {
      return "delivery";
    }
  };

  // Clear any existing sample data before generating new ones
  const clearExistingSampleData = () => {
    // Clear any existing sample orders
    window.dispatchEvent(new CustomEvent("clear-orders", {}));
    // Clear any existing kitchen orders
    window.dispatchEvent(new CustomEvent("clear-kitchen-orders", {}));
    // Clear any existing transactions
    window.dispatchEvent(new CustomEvent("clear-transactions", {}));
  };

  const generateSampleOrders = () => {
    // Clear existing sample data first
    clearExistingSampleData();
    setIsGenerating(true);
    const count = parseInt(numOrders, 10) || 5;

    // Generate orders with a slight delay between each to simulate real-world scenario
    const generateOrder = (index: number) => {
      setTimeout(() => {
        try {
          const source = getRandomSource();
          const orderType = getRandomOrderType(source);
          const items = getRandomItems(5);

          if (items.length === 0) {
            if (index === count - 1) setIsGenerating(false);
            return;
          }

          const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const order = {
            id: orderId,
            orderNumber: `${source.charAt(0)}-${Math.floor(1000 + Math.random() * 9000)}`,
            source: source as "iPad" | "Talabat" | "Snoonu" | "Deliveroo",
            status: "new",
            items: items,
            timestamp: new Date().toLocaleTimeString(),
            tableNumber:
              orderType === "dine-in"
                ? `Table ${Math.floor(Math.random() * 9) + 1}`
                : undefined,
            orderType: orderType as "dine-in" | "delivery" | "walk-in",
            customerName:
              orderType === "delivery"
                ? ["John", "Sarah", "Mohammed", "Fatima", "Alex"][
                    Math.floor(Math.random() * 5)
                  ]
                : undefined,
            customerPhone:
              orderType === "delivery"
                ? `+974 ${Math.floor(Math.random() * 90000000) + 10000000}`
                : undefined,
            deliveryAddress:
              orderType === "delivery"
                ? "123 Sample Street, Doha, Qatar"
                : undefined,
            deviceName:
              source === "iPad"
                ? ["Front Counter", "Bar Area", "Dining Area"][
                    Math.floor(Math.random() * 3)
                  ]
                : undefined,
          };

          console.log(`Dispatching sample order #${index + 1}:`, order);

          // Dispatch to order queue
          window.dispatchEvent(
            new CustomEvent("new-order", {
              detail: order,
            }),
          );

          // Dispatch to kitchen display
          const kitchenOrder = {
            id: orderId,
            orderNumber: order.orderNumber,
            source: order.source,
            items: order.items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              type: item.type,
              customizations: item.customizations,
              status: "pending",
              prepTime: item.type === "food" ? 8 : 3,
            })),
            status: "pending",
            createdAt: new Date(),
            tableNumber: order.tableNumber,
            isDelivery: order.orderType === "delivery",
            customerName: order.customerName,
          };

          window.dispatchEvent(
            new CustomEvent("new-kitchen-order", {
              detail: kitchenOrder,
            }),
          );

          // Create transaction for analytics
          const transaction = {
            id: orderId,
            orderNumber: order.orderNumber,
            date: new Date(),
            amount: items.reduce(
              (sum, item) =>
                sum + item.quantity * (item.type === "food" ? 45 : 20),
              0,
            ),
            source: order.source.toLowerCase(),
            status: "completed",
            paymentMethod: ["Cash", "Card", "QLUB"][
              Math.floor(Math.random() * 3)
            ],
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.type === "food" ? 45 : 20,
            })),
            tableNumber: order.tableNumber?.replace("Table ", "") || undefined,
            orderType: order.orderType,
          };

          window.dispatchEvent(
            new CustomEvent("new-transaction", { detail: transaction }),
          );

          window.dispatchEvent(
            new CustomEvent("new-analytics-transaction", {
              detail: transaction,
            }),
          );

          if (index === count - 1) {
            setIsGenerating(false);
            setIsOpen(false);
          }
        } catch (error) {
          console.error("Error generating sample order:", error);
          if (index === count - 1) {
            setIsGenerating(false);
          }
        }
      }, index * 800); // 800ms delay between orders
    };

    for (let i = 0; i < count; i++) {
      generateOrder(i);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full"
      >
        Generate Sample Orders
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Sample Orders</DialogTitle>
            <DialogDescription>
              Create sample orders to test the system workflow between order
              queue and kitchen display.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="num-orders" className="text-right">
                Number of Orders
              </Label>
              <Input
                id="num-orders"
                type="number"
                min="1"
                max="20"
                value={numOrders}
                onChange={(e) => setNumOrders(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-source" className="text-right">
                Order Source
              </Label>
              <Select value={orderSource} onValueChange={setOrderSource}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed (Random)</SelectItem>
                  <SelectItem value="iPad">iPad</SelectItem>
                  <SelectItem value="Talabat">Talabat</SelectItem>
                  <SelectItem value="Snoonu">Snoonu</SelectItem>
                  <SelectItem value="Deliveroo">Deliveroo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-food"
                checked={includeFood}
                onCheckedChange={(checked) =>
                  setIncludeFood(checked as boolean)
                }
              />
              <Label htmlFor="include-food">Include Food Items</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-beverages"
                checked={includeBeverages}
                onCheckedChange={(checked) =>
                  setIncludeBeverages(checked as boolean)
                }
              />
              <Label htmlFor="include-beverages">Include Beverage Items</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={generateSampleOrders}
              disabled={isGenerating || (!includeFood && !includeBeverages)}
            >
              {isGenerating ? "Generating..." : "Generate Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SampleOrdersGenerator;
