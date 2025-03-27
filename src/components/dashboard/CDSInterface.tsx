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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Coffee,
  Utensils,
  Plus,
  Minus,
  ShoppingCart,
  Send,
  Printer,
  Check,
  CreditCard,
  Clock,
  User,
  Table as TableIcon,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMenuData } from "./MenuDataContext";
import { createTransaction } from "@/lib/transactionService";
import "./CDSInterface.css";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  type: "beverage" | "food";
  category?: string;
  customizationOptions?: {
    [key: string]: string[] | undefined;
  };
  customizationPrices?: {
    [key: string]: { [option: string]: number };
  };
  customizationRequired?: {
    [key: string]: boolean;
  };
  customizationMultiSelect?: {
    [key: string]: boolean;
  };
  image?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  selectedOptions?: { [key: string]: string | string[] };
  totalPrice: number;
}

interface CDSInterfaceProps {
  deviceName?: string;
  deviceId?: string;
  userId?: string;
}

const CDSInterface = ({
  deviceName = "iPad 1",
  deviceId = "ipad-1",
  userId,
}: CDSInterfaceProps) => {
  const menuContext = useMenuData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [itemsByCategory, setItemsByCategory] = useState<{
    [key: string]: MenuItem[];
  }>({});
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizationSelections, setCustomizationSelections] = useState<{
    [key: string]: string | string[];
  }>({});
  const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] =
    useState(false);
  const [customerName, setCustomerName] = useState<string>("Guest Customer");
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isCustomerInfoSet, setIsCustomerInfoSet] = useState(true); // Set to true by default to skip the dialog
  const [isPayNowSelected, setIsPayNowSelected] = useState(false);
  // Add state to store menu items received from MenuManagement
  const [menuItemsFromContext, setMenuItemsFromContext] = useState<MenuItem[]>(
    [],
  );

  // Sample menu items to use if no menu items are available in context
  const sampleMenuItems: MenuItem[] = [
    {
      id: "1",
      name: "Jasmine Green Tea",
      price: 4.99,
      description: "Fragrant jasmine-infused green tea",
      type: "beverage",
      category: "Tea Beverages",
      customizationOptions: {
        size: ["Small", "Medium", "Large"],
        ice: ["No Ice", "Light Ice", "Regular Ice", "Extra Ice"],
        sweetness: ["0%", "25%", "50%", "75%", "100%"],
      },
      customizationPrices: {
        size: { Small: 0, Medium: 1, Large: 2 },
      },
      customizationRequired: {
        size: true,
        sweetness: true,
      },
    },
    {
      id: "2",
      name: "Oolong Milk Tea",
      price: 5.99,
      description: "Creamy milk tea with oolong base",
      type: "beverage",
      category: "Tea Beverages",
      customizationOptions: {
        size: ["Small", "Medium", "Large"],
        ice: ["No Ice", "Light Ice", "Regular Ice", "Extra Ice"],
        sweetness: ["0%", "25%", "50%", "75%", "100%"],
        toppings: ["Boba", "Grass Jelly", "Aloe Vera", "Pudding"],
      },
      customizationPrices: {
        size: { Small: 0, Medium: 1, Large: 2 },
        toppings: {
          Boba: 0.75,
          "Grass Jelly": 0.75,
          "Aloe Vera": 0.75,
          Pudding: 1,
        },
      },
      customizationRequired: {
        size: true,
        sweetness: true,
      },
      customizationMultiSelect: {
        toppings: true,
      },
    },
    {
      id: "3",
      name: "Matcha Latte",
      price: 6.49,
      description: "Premium matcha green tea with steamed milk",
      type: "beverage",
      category: "Tea Beverages",
      customizationOptions: {
        size: ["Small", "Medium", "Large"],
        milk: ["Whole Milk", "Oat Milk", "Almond Milk", "Soy Milk"],
        sweetness: ["0%", "25%", "50%", "75%", "100%"],
      },
      customizationPrices: {
        size: { Small: 0, Medium: 1, Large: 2 },
        milk: {
          "Whole Milk": 0,
          "Oat Milk": 1,
          "Almond Milk": 1,
          "Soy Milk": 0.75,
        },
      },
      customizationRequired: {
        size: true,
        milk: true,
      },
    },
    {
      id: "4",
      name: "Pork Bao Bun",
      price: 3.99,
      description: "Steamed bun filled with savory pork",
      type: "food",
      category: "Snacks",
    },
    {
      id: "5",
      name: "Egg Tart",
      price: 2.99,
      description: "Flaky pastry with sweet egg custard filling",
      type: "food",
      category: "Snacks",
    },
    {
      id: "6",
      name: "Scallion Pancake",
      price: 4.49,
      description: "Crispy savory pancake with scallions",
      type: "food",
      category: "Snacks",
    },
  ];

  // Always use menu items from context if available, otherwise use sample items
  // If we have received menu items from MenuManagement via the event, use those instead
  const effectiveMenuItems =
    menuItemsFromContext.length > 0
      ? menuItemsFromContext
      : menuContext?.menuItems?.length > 0
        ? menuContext.menuItems
        : sampleMenuItems;

  // Request menu items if not available
  useEffect(() => {
    const loadMenu = async () => {
      if (
        menuContext &&
        (!menuContext.menuItems || menuContext.menuItems.length === 0)
      ) {
        console.log(
          "CDSInterface: No menu items found, loading from context...",
        );
        try {
          await menuContext.loadMenuItems();
        } catch (error) {
          console.error("CDSInterface: Error loading menu items:", error);
          // Continue with sample menu items as fallback
        }
      } else {
        console.log(
          "CDSInterface: Menu items available:",
          effectiveMenuItems.length,
        );
      }
    };

    loadMenu();

    // Request menu items from MenuManagement
    console.log(
      "CDSInterface: Requesting latest menu items from MenuManagement",
    );
    window.dispatchEvent(new CustomEvent("request-menu-items"));

    // Set up a periodic refresh of menu items every 5 minutes
    const menuRefreshInterval = setInterval(
      () => {
        if (menuContext) {
          console.log("CDSInterface: Refreshing menu items...");
          menuContext.loadMenuItems().catch((error) => {
            console.error("CDSInterface: Error refreshing menu items:", error);
          });
          // Also request menu items from MenuManagement
          window.dispatchEvent(new CustomEvent("request-menu-items"));
        }
      },
      5 * 60 * 1000, // 5 minutes
    );

    return () => clearInterval(menuRefreshInterval);
  }, [menuContext]);

  // Listen for menu item updates from MenuManagement
  useEffect(() => {
    const handleMenuItemsUpdate = (event: CustomEvent) => {
      console.log(
        "CDSInterface: Menu items updated from MenuManagement:",
        event.detail?.length || 0,
      );
      // If we receive updated menu items, use them directly instead of sample items
      if (
        event.detail &&
        Array.isArray(event.detail) &&
        event.detail.length > 0
      ) {
        // Override the sample menu items with the ones from MenuManagement
        const updatedMenuItems = event.detail;
        console.log(
          "CDSInterface: Using updated menu items from MenuManagement",
          updatedMenuItems.length,
        );
        // Store the updated menu items in state
        setMenuItemsFromContext(updatedMenuItems);
        // This will trigger the other useEffect that organizes items by category
        setItemsByCategory({});
        setActiveCategory("");
        // Force a re-render with the new menu items
        setTimeout(() => {
          // This is a hack to force a re-render with the new menu items
          setCategories([]);
        }, 100);
      }
    };

    window.addEventListener(
      "menu-items-updated" as any,
      handleMenuItemsUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "menu-items-updated" as any,
        handleMenuItemsUpdate as EventListener,
      );
    };
  }, []);

  // Extract unique categories from menu items and organize items by category
  useEffect(() => {
    if (effectiveMenuItems && effectiveMenuItems.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          effectiveMenuItems.map((item) => item.category || "Uncategorized"),
        ),
      ).map((category) => ({
        id: category.toLowerCase().replace(/\s+/g, "-"),
        name: category,
      }));

      const itemsGroupedByCategory = uniqueCategories.reduce<{
        [key: string]: MenuItem[];
      }>((acc, category) => {
        acc[category.id] = effectiveMenuItems.filter(
          (item) => (item.category || "Uncategorized") === category.name,
        );
        return acc;
      }, {});

      setCategories(uniqueCategories);
      setItemsByCategory(itemsGroupedByCategory);

      // Set active category to the first one if not already set
      if (!activeCategory && uniqueCategories.length > 0) {
        setActiveCategory(uniqueCategories[0].id);
      }
    }
  }, [effectiveMenuItems, activeCategory]);

  const openCustomizationDialog = (item: MenuItem) => {
    setSelectedItem(item);

    // Initialize customization selections with default values
    if (item.customizationOptions) {
      const initialSelections: { [key: string]: string | string[] } = {};
      Object.entries(item.customizationOptions).forEach(([key, options]) => {
        if (options && options.length > 0) {
          // Check if this option is required or has multiSelect
          const isRequired = item.customizationRequired?.[key] || false;
          const isMultiSelect = item.customizationMultiSelect?.[key] || false;

          if (isMultiSelect) {
            // For multi-select, initialize with empty array
            initialSelections[key] = [];
          } else if (isRequired) {
            // For required single-select, initialize with first option
            initialSelections[key] = options[0];
          } else {
            // For optional single-select, initialize with empty string
            initialSelections[key] = "";
          }
        }
      });
      setCustomizationSelections(initialSelections);
    } else {
      setCustomizationSelections({});
    }

    setIsCustomizationDialogOpen(true);
  };

  const calculateItemPrice = (
    item: MenuItem,
    selections: { [key: string]: string | string[] },
  ) => {
    let basePrice = item.price;

    // Add customization prices
    if (item.customizationPrices) {
      Object.entries(selections).forEach(([key, selectedOption]) => {
        if (Array.isArray(selectedOption)) {
          // Handle multi-select options
          selectedOption.forEach((option) => {
            const optionPrice = item.customizationPrices?.[key]?.[option] || 0;
            basePrice += optionPrice;
          });
        } else if (selectedOption) {
          // Handle single-select options
          const optionPrice =
            item.customizationPrices?.[key]?.[selectedOption] || 0;
          basePrice += optionPrice;
        }
      });
    }

    return basePrice;
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const totalPrice = calculateItemPrice(
      selectedItem,
      customizationSelections,
    );

    // Check if the same item with the same customizations already exists in cart
    const existingItemIndex = cart.findIndex((cartItem) => {
      if (cartItem.id !== selectedItem.id) return false;

      // Check if customizations match
      if (
        !cartItem.selectedOptions &&
        Object.keys(customizationSelections).length > 0
      )
        return false;
      if (
        cartItem.selectedOptions &&
        Object.keys(customizationSelections).length === 0
      )
        return false;

      // Compare each customization option
      for (const [key, value] of Object.entries(customizationSelections)) {
        if (Array.isArray(value)) {
          // For multi-select options, compare arrays
          const cartValue = cartItem.selectedOptions?.[key];
          if (!Array.isArray(cartValue)) return false;
          if (value.length !== cartValue.length) return false;
          if (!value.every((v) => cartValue.includes(v))) return false;
        } else {
          // For single-select options
          if (cartItem.selectedOptions?.[key] !== value) return false;
        }
      }

      return true;
    });

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].totalPrice =
        updatedCart[existingItemIndex].quantity * totalPrice;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        ...selectedItem,
        quantity: 1,
        selectedOptions: { ...customizationSelections },
        totalPrice: totalPrice,
      };
      setCart([...cart, cartItem]);
    }

    setIsCustomizationDialogOpen(false);
  };

  const addToCartDirectly = (item: MenuItem) => {
    // If item has customization options, open dialog
    if (
      item.customizationOptions &&
      Object.keys(item.customizationOptions).length > 0
    ) {
      openCustomizationDialog(item);
    } else {
      // Otherwise add directly to cart
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (cartItem) => cartItem.id === item.id,
        );

        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
                  totalPrice: (cartItem.quantity + 1) * item.price,
                }
              : cartItem,
          );
        } else {
          return [
            ...prevCart,
            {
              ...item,
              quantity: 1,
              totalPrice: item.price,
            },
          ];
        }
      });
    }
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const item = prevCart[index];

      if (item.quantity > 1) {
        const updatedCart = [...prevCart];
        updatedCart[index].quantity -= 1;
        updatedCart[index].totalPrice =
          updatedCart[index].quantity * (item.totalPrice / item.quantity);
        return updatedCart;
      } else {
        return prevCart.filter((_, i) => i !== index);
      }
    });
  };

  const increaseCartItemQuantity = (index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      const item = updatedCart[index];
      updatedCart[index].quantity += 1;
      updatedCart[index].totalPrice =
        updatedCart[index].quantity * (item.totalPrice / item.quantity);
      return updatedCart;
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const formatOptionLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const handleSetCustomerInfo = () => {
    if (!customerName) {
      alert("Please enter a customer name");
      return;
    }
    setIsCustomerInfoSet(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentComplete = async () => {
    if (!customerName) {
      alert("Please enter a customer name");
      return;
    }
    if (isPayNowSelected && !selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setIsPaymentDialogOpen(false);
    setIsPrintingReceipt(true);

    try {
      // Generate order number
      const newOrderNumber = `CDS-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderNumber(newOrderNumber);

      // Create order for order queue
      const order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        orderNumber: newOrderNumber,
        source: "iPad" as const,
        status: "new" as const,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          customizations: item.selectedOptions,
        })),
        timestamp: new Date().toLocaleTimeString(),
        orderType: "walk-in" as const,
        customerName: customerName,
        deviceName: deviceName,
      };

      // Try to save to Supabase using transactionService
      try {
        // Use the transactionService instead of direct Supabase calls
        const transactionResult = await createTransaction({
          orderNumber: newOrderNumber,
          amount: calculateTotal(),
          source: "cds",
          status: isPayNowSelected ? "completed" : "pending",
          paymentMethod: selectedPaymentMethod || "Pay Later",
          orderType: "walk-in",
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.totalPrice / item.quantity,
            type: item.type,
            customizations: item.selectedOptions || undefined,
          })),
          userId: userId || undefined,
          createdBy: customerName || "Guest",
        });

        console.log("Transaction saved to database:", transactionResult);
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue anyway for demo purposes
      }

      // Dispatch to order queue - do this after database operations
      try {
        window.dispatchEvent(
          new CustomEvent("new-order", {
            detail: order,
          }),
        );
        console.log("Order dispatched to queue:", order);

        // Also dispatch directly to kitchen display if there are food items
        if (cart.some((item) => item.type === "food")) {
          const kitchenOrder = {
            id: order.id,
            orderNumber: order.orderNumber,
            source: "iPad",
            items: cart
              .filter((item) => item.type === "food")
              .map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                type: "food",
                customizations: item.selectedOptions
                  ? Object.values(item.selectedOptions).filter(Boolean)
                  : [],
                status: "pending",
                prepTime: 8, // Default prep time for food items
              })),
            status: "pending",
            createdAt: new Date(),
            isDelivery: false,
            customerName: customerName,
          };

          window.dispatchEvent(
            new CustomEvent("new-kitchen-order", {
              detail: kitchenOrder,
            }),
          );
          console.log(
            "Dispatched food items directly to kitchen display:",
            kitchenOrder,
          );
        }
      } catch (dispatchError) {
        console.error("Error dispatching order:", dispatchError);
      }

      // Dispatch transaction to analytics - do this after database operations
      try {
        window.dispatchEvent(
          new CustomEvent("new-analytics-transaction", {
            detail: order,
          }),
        );
        console.log("Transaction dispatched to analytics:", order);
      } catch (analyticsError) {
        console.error(
          "Error dispatching transaction to analytics:",
          analyticsError,
        );
      }

      // Clear cart and reset order info
      setCart([]);
      setIsOrderSent(true);

      // Simulate receipt printing
      setTimeout(() => {
        setIsPrintingReceipt(false);
      }, 2000);
    } catch (error) {
      console.error("Payment processing error:", error);
      // Continue anyway for demo purposes
      setCart([]);
      setIsOrderSent(true);
      setTimeout(() => {
        setIsPrintingReceipt(false);
      }, 2000);
    }
  };

  return (
    <div className="cds-interface bg-white">
      {menuContext?.isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading menu items...</p>
        </div>
      ) : isCustomerInfoSet ? (
        <div className="flex h-full">
          <div className="w-2/3 p-4 border-r">
            <Tabs defaultValue={categories[0]?.id || ""} className="w-full">
              <TabsList className="mb-4 flex flex-wrap">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.name.toLowerCase().includes("beverage") ? (
                      <Coffee className="h-4 w-4" />
                    ) : (
                      <Utensils className="h-4 w-4" />
                    )}
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="h-[calc(100vh-12rem)] overflow-y-auto"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {itemsByCategory[category.id]?.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToCartDirectly(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <Badge variant="outline">
                              ${item.price.toFixed(2)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="w-1/3 p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Current Order</h2>
                <p className="text-sm text-gray-500">
                  Customer: {customerName}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-grow mb-4 border rounded-md">
              {cart.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Cart is empty. Add items to get started.
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cart.map((item, index) => (
                    <Card key={`${item.id}-${index}`} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="font-medium">
                              ${item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          {item.selectedOptions &&
                            Object.entries(item.selectedOptions).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="text-xs text-gray-500 mt-1"
                                >
                                  <span className="font-medium">
                                    {formatOptionLabel(key)}:
                                  </span>{" "}
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : value}
                                </div>
                              ),
                            )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(index)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => increaseCartItemQuantity(index)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total:</span>
                <span className="font-bold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsPayNowSelected(false);
                    setIsPaymentDialogOpen(true);
                  }}
                  disabled={cart.length === 0}
                >
                  <Clock className="mr-2 h-4 w-4" /> Pay Later
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsPayNowSelected(true);
                    setIsPaymentDialogOpen(true);
                  }}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Welcome to {deviceName}</CardTitle>
              <CardDescription>
                Please enter customer information to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="customerName"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Customer Name
                </label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSetCustomerInfo}>
                <User className="mr-2 h-4 w-4" /> Set Customer Info
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Customization Dialog */}
      <Dialog
        open={isCustomizationDialogOpen}
        onOpenChange={setIsCustomizationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.name} - ${selectedItem?.price.toFixed(2)}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedItem?.customizationOptions &&
              Object.entries(selectedItem.customizationOptions).map(
                ([key, options]) => {
                  const isRequired =
                    selectedItem.customizationRequired?.[key] || false;
                  const isMultiSelect =
                    selectedItem.customizationMultiSelect?.[key] || false;

                  return (
                    <div key={key} className="grid gap-2">
                      <label className="text-sm font-medium">
                        {formatOptionLabel(key)}
                        {isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {options?.map((option) => {
                          const optionPrice =
                            selectedItem.customizationPrices?.[key]?.[option] ||
                            0;
                          const isSelected = isMultiSelect
                            ? Array.isArray(customizationSelections[key]) &&
                              (
                                customizationSelections[key] as string[]
                              ).includes(option)
                            : customizationSelections[key] === option;

                          return (
                            <Badge
                              key={option}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                if (isMultiSelect) {
                                  // Handle multi-select
                                  setCustomizationSelections((prev) => {
                                    const currentSelections = Array.isArray(
                                      prev[key],
                                    )
                                      ? [...(prev[key] as string[])]
                                      : [];

                                    if (isSelected) {
                                      // Remove if already selected
                                      return {
                                        ...prev,
                                        [key]: currentSelections.filter(
                                          (item) => item !== option,
                                        ),
                                      };
                                    } else {
                                      // Add if not selected
                                      return {
                                        ...prev,
                                        [key]: [...currentSelections, option],
                                      };
                                    }
                                  });
                                } else {
                                  // Handle single-select
                                  setCustomizationSelections((prev) => ({
                                    ...prev,
                                    [key]: option,
                                  }));
                                }
                              }}
                            >
                              {option}
                              {optionPrice > 0 &&
                                ` (+$${optionPrice.toFixed(2)})`}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCustomizationDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="button" onClick={addToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isPayNowSelected ? "Payment" : "Send to Kitchen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isPayNowSelected && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="flex flex-wrap gap-2">
                  {["Cash", "Credit Card", "Debit Card", "Mobile Payment"].map(
                    (method) => (
                      <Badge
                        key={method}
                        variant={
                          selectedPaymentMethod === method
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handlePaymentMethodSelect(method)}
                      >
                        {method}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold">Total:</span>
                <span className="font-bold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="button" onClick={handlePaymentComplete}>
              {isPayNowSelected ? (
                <>
                  <CreditCard className="mr-2 h-4 w-4" /> Complete Payment
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send to Kitchen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Printing Dialog */}
      <Dialog open={isPrintingReceipt} onOpenChange={setIsPrintingReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isOrderSent ? "Order Completed!" : "Processing Payment..."}
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            {isOrderSent ? (
              <div className="space-y-4">
                <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Thank You!</h3>
                <p>Order #{orderNumber} has been completed.</p>
                <p className="text-sm text-gray-500">
                  A receipt has been printed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto rounded-full p-3 w-16 h-16 flex items-center justify-center">
                  <Printer className="h-8 w-8 animate-pulse" />
                </div>
                <p>Processing your payment...</p>
                <p className="text-sm text-gray-500">
                  Please wait while we complete your transaction.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CDSInterface;
