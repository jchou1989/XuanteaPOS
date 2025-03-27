import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  CreditCard,
  Printer,
  Plus,
  Minus,
  ShoppingCart,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useMenuData } from "./MenuDataContext";
import { supabase } from "@/lib/supabase";
import {
  createTransaction,
  updateTransactionStatus,
} from "@/lib/transactionService";

interface MenuItem {
  id: string;
  beverageId?: string;
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
  preparationNotes?: string;
  image?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  selectedOptions?: { [key: string]: string | string[] };
  totalPrice: number;
}

interface POSSystemProps {
  menuItems?: MenuItem[];
}

const POSSystem = ({ menuItems = [] }: POSSystemProps) => {
  // Get menu items from context
  const menuContext = useMenuData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [itemsByCategory, setItemsByCategory] = useState<{
    [key: string]: MenuItem[];
  }>({});
  // Add state to store menu items received from MenuManagement
  const [menuItemsFromContext, setMenuItems] = useState<MenuItem[]>([]);

  // Request menu items if not available
  useEffect(() => {
    const loadMenu = async () => {
      if (
        menuContext &&
        (!menuContext.menuItems || menuContext.menuItems.length === 0)
      ) {
        console.log("POSSystem: No menu items found, loading from context...");
        try {
          await menuContext.loadMenuItems();
        } catch (error) {
          console.error("POSSystem: Error loading menu items:", error);
          // Continue with empty menu items as fallback
        }
      } else {
        console.log(
          "POSSystem: Menu items available:",
          menuContext?.menuItems?.length || 0,
        );
      }
    };

    loadMenu();

    // Request menu items from MenuManagement
    console.log("POSSystem: Requesting latest menu items from MenuManagement");
    window.dispatchEvent(new CustomEvent("request-menu-items"));

    // Set up a periodic refresh of menu items every 30 minutes
    const menuRefreshInterval = setInterval(
      () => {
        if (menuContext) {
          console.log("POSSystem: Refreshing menu items...");
          menuContext.loadMenuItems().catch((error) => {
            console.error("POSSystem: Error refreshing menu items:", error);
          });
        }
      },
      30 * 60 * 1000,
    ); // 30 minutes

    return () => clearInterval(menuRefreshInterval);
  }, [menuContext]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizationSelections, setCustomizationSelections] = useState<{
    [key: string]: string | string[];
  }>({});
  const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] =
    useState(false);
  const [dineInTableNumber, setDineInTableNumber] = useState<string>("");
  const [dineInCustomerName, setDineInCustomerName] = useState<string>("");
  const [availableTables, setAvailableTables] = useState<
    { id: number; name: string }[]
  >([]);
  const [holdBilling, setHoldBilling] = useState(false);
  const [isDineInDialogOpen, setIsDineInDialogOpen] = useState(false);
  const [transactionToVoid, setTransactionToVoid] = useState<any>(null);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [isPreviousTransactionsOpen, setIsPreviousTransactionsOpen] =
    useState(false);
  const [previousTransactions, setPreviousTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isPrintingPreviousReceipt, setIsPrintingPreviousReceipt] =
    useState(false);
  const [noTablesAvailableError, setNoTablesAvailableError] = useState(false);

  // Always use menu items from context if available, otherwise use props
  // If we have received menu items from MenuManagement via the event, use those instead
  const effectiveMenuItems =
    menuItemsFromContext.length > 0
      ? menuItemsFromContext
      : menuContext?.menuItems?.length > 0
        ? menuContext.menuItems
        : menuItems;

  // Listen for menu item updates from MenuManagement
  useEffect(() => {
    const handleMenuItemsUpdate = (event: CustomEvent) => {
      console.log(
        "POSSystem: Menu items updated from MenuManagement:",
        event.detail?.length || 0,
      );
      // If we receive updated menu items, use them directly
      if (
        event.detail &&
        Array.isArray(event.detail) &&
        event.detail.length > 0
      ) {
        // This will trigger the other useEffect that organizes items by category
        setMenuItems(event.detail);
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
    console.log("Menu items in POSSystem:", effectiveMenuItems);
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

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [isPrintingLabel, setIsPrintingLabel] = useState(false);

  // Fetch available tables from TableManagement
  useEffect(() => {
    const handleAvailableTables = (event: CustomEvent) => {
      console.log("POS: Received available tables:", event.detail);
      setAvailableTables(event.detail || []);
      // Reset error state when we receive tables
      if (event.detail && event.detail.length > 0) {
        setNoTablesAvailableError(false);
      }
    };

    window.addEventListener(
      "available-tables" as any,
      handleAvailableTables as EventListener,
    );

    // Request available tables
    window.dispatchEvent(new CustomEvent("request-available-tables"));

    // Set up a periodic refresh of available tables every 10 seconds
    const tableRefreshInterval = setInterval(() => {
      window.dispatchEvent(new CustomEvent("request-available-tables"));
    }, 10 * 1000); // 10 seconds

    return () => {
      window.removeEventListener(
        "available-tables" as any,
        handleAvailableTables as EventListener,
      );
      clearInterval(tableRefreshInterval);
    };
  }, []);

  // Load previous transactions and listen for clear transactions event
  useEffect(() => {
    // Handler for clearing transactions
    const handleClearTransactions = () => {
      console.log("Clearing all transactions");
      setPreviousTransactions([]);
    };

    window.addEventListener(
      "clear-transactions" as any,
      handleClearTransactions as EventListener,
    );

    // This would normally come from a context or API
    // For now, we'll use a custom event listener to receive transactions
    const handleNewTransaction = (event: CustomEvent) => {
      setPreviousTransactions((prev) => [event.detail, ...prev]);
    };

    window.addEventListener(
      "new-transaction" as any,
      handleNewTransaction as EventListener,
    );

    return () => {
      window.removeEventListener(
        "new-transaction" as any,
        handleNewTransaction as EventListener,
      );
      window.removeEventListener(
        "clear-transactions" as any,
        handleClearTransactions as EventListener,
      );
    };
  }, []);

  const handleCheckout = () => {
    try {
      // Validate cart is not empty
      if (cart.length === 0) {
        alert("Please add items to your order before checkout.");
        return;
      }

      // Check if this is a dine-in order
      if (!dineInTableNumber) {
        // Ask if this is dine-in
        setIsDineInDialogOpen(true);
      } else {
        // Proceed to payment
        setSelectedPaymentMethod("");
        setIsPaymentDialogOpen(true);
      }
    } catch (error) {
      console.error("Error in handleCheckout:", error);
      alert("An error occurred while processing checkout. Please try again.");
    }
  };

  const handlePaymentComplete = async () => {
    try {
      if (!selectedPaymentMethod) {
        alert("Please select a payment method");
        return;
      }

      // Process payment
      setIsPaymentDialogOpen(false);
      setIsPrintingReceipt(true);

      // If hold billing is enabled for dine-in, just close the dialog and keep the cart
      if (holdBilling && dineInTableNumber) {
        alert(
          `Order added to table ${dineInTableNumber}. Billing is on hold until customer is ready to pay.`,
        );
        setIsPrintingReceipt(false);
        return;
      }

      // Get user info for the transaction
      const userName = localStorage.getItem("userName") || "Unknown";
      const userId = localStorage.getItem("userId");

      // Create transaction record in Supabase
      const orderNumber = `A-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = `tx-${Date.now()}`;
      let supabaseTransactionId = null;

      // Create transaction record for UI first (before database operations)
      const transaction = {
        id: transactionId, // We'll update this if we get a DB ID
        orderNumber: orderNumber,
        date: new Date(),
        amount: calculateTotal(),
        source: "pos",
        status: "completed",
        paymentMethod: selectedPaymentMethod,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.totalPrice / item.quantity,
        })),
        tableNumber: dineInTableNumber || undefined,
        orderType: dineInTableNumber ? "dine-in" : "walk-in",
        createdBy: userName,
      };

      // Store transaction in localStorage as backup in case of database failure
      try {
        const pendingTransactions = JSON.parse(
          localStorage.getItem("pendingTransactions") || "[]",
        );
        pendingTransactions.push({
          orderNumber,
          amount: calculateTotal(),
          source: "pos",
          status: "completed",
          paymentMethod: selectedPaymentMethod,
          tableNumber: dineInTableNumber || undefined,
          orderType: dineInTableNumber ? "dine-in" : "walk-in",
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.totalPrice / item.quantity,
            type: item.type,
          })),
          createdBy: userName,
          userId: userId || undefined,
        });
        localStorage.setItem(
          "pendingTransactions",
          JSON.stringify(pendingTransactions),
        );
      } catch (localStorageError) {
        console.error(
          "Error storing transaction in localStorage:",
          localStorageError,
        );
        // Continue anyway
      }

      // Create order items for kitchen display
      const orderItems = cart.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        quantity: item.quantity,
        type: item.type,
        customizations: item.selectedOptions
          ? Object.entries(item.selectedOptions)
              .map(([key, value]) =>
                Array.isArray(value) ? value.join(", ") : (value as string),
              )
              .filter(Boolean)
          : undefined,
        status: "pending",
        prepTime: item.type === "food" ? 8 : 3,
      }));

      // Prepare queue order object
      const queueOrder = {
        id: transaction.id,
        orderNumber: transaction.orderNumber,
        source: "pos",
        status: "new",
        items: cart.map((item) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: item.name,
          type: item.type === "food" ? "food" : "beverage",
          quantity: item.quantity,
          customizations: item.selectedOptions
            ? Object.entries(item.selectedOptions).reduce(
                (acc, [key, value]) => {
                  const formattedKey = key.replace(/([A-Z])/g, (match) =>
                    match.toLowerCase(),
                  );
                  if (Array.isArray(value)) {
                    acc[formattedKey] = value.join(", ");
                  } else if (value) {
                    acc[formattedKey] = value as string;
                  }
                  return acc;
                },
                {} as any,
              )
            : undefined,
        })),
        timestamp: new Date().toLocaleTimeString(),
        tableNumber: dineInTableNumber
          ? `Table ${dineInTableNumber}`
          : undefined,
        orderType: dineInTableNumber ? "dine-in" : "walk-in",
        deviceName: "POS",
        createdBy: userName,
        customerName: dineInCustomerName || undefined,
      };

      // Prepare kitchen order object
      const kitchenOrder = {
        id: transaction.id,
        orderNumber: transaction.orderNumber,
        source: "pos",
        items: orderItems,
        status: "pending",
        createdAt: new Date(),
        tableNumber: dineInTableNumber
          ? `Table ${dineInTableNumber}`
          : undefined,
        isDelivery: false,
        customerName: dineInCustomerName || undefined,
        createdBy: userName,
      };

      // Now try database operations
      try {
        const { data: transactionData, error: transactionError } =
          await supabase
            .from("transactions")
            .insert([
              {
                order_number: orderNumber,
                amount: calculateTotal(),
                source: "pos",
                status: "completed",
                payment_method: selectedPaymentMethod,
                table_number: dineInTableNumber || null,
                order_type: dineInTableNumber ? "dine-in" : "walk-in",
                user_id: userId || null,
                created_by: userName,
                customer_name: dineInCustomerName || null,
              },
            ])
            .select();

        if (transactionError) {
          console.error("Transaction insert error:", transactionError);
        } else if (transactionData && transactionData.length > 0) {
          // Update transaction ID with the one from the database
          supabaseTransactionId = transactionData[0].id;
          transaction.id = supabaseTransactionId;
          kitchenOrder.id = supabaseTransactionId;
          queueOrder.id = supabaseTransactionId;

          // Add transaction items
          const transactionItems = cart.map((item) => ({
            transaction_id: supabaseTransactionId,
            name: item.name,
            quantity: item.quantity,
            price: item.totalPrice / item.quantity,
            type: item.type,
            customizations: item.selectedOptions ? item.selectedOptions : null,
          }));

          const { error: itemsError } = await supabase
            .from("transaction_items")
            .insert(transactionItems);

          if (itemsError) {
            console.error("Transaction items insert error:", itemsError);
          }
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue with UI updates even if database operations fail
      }

      // Simulate printing receipt
      setTimeout(() => {
        try {
          setIsPrintingReceipt(false);
          setIsPrintingLabel(true);

          // Simulate printing label
          setTimeout(() => {
            try {
              setIsPrintingLabel(false);

              // Now dispatch all events after database operations are complete
              try {
                // Add to transaction history
                window.dispatchEvent(
                  new CustomEvent("new-transaction", { detail: transaction }),
                );
                console.log("Transaction event dispatched", transaction);

                // Dispatch to reports analytics
                window.dispatchEvent(
                  new CustomEvent("new-analytics-transaction", {
                    detail: transaction,
                  }),
                );
                console.log("Analytics transaction event dispatched");

                // Send order to kitchen display if there are food items
                if (cart.some((item) => item.type === "food")) {
                  window.dispatchEvent(
                    new CustomEvent("new-kitchen-order", {
                      detail: kitchenOrder,
                    }),
                  );
                  console.log(
                    "Kitchen order dispatched with food items:",
                    kitchenOrder,
                  );
                } else {
                  console.log(
                    "No food items in order, skipping kitchen display dispatch",
                  );
                }

                // Update order queue
                window.dispatchEvent(
                  new CustomEvent("new-order", {
                    detail: queueOrder,
                  }),
                );
                console.log("Order queue updated", queueOrder);

                // Show success message
                alert(
                  `Order placed! Total: QAR ${calculateTotal().toFixed(2)} - Paid with ${selectedPaymentMethod}`,
                );
              } catch (eventError) {
                console.error("Error dispatching events:", eventError);
                alert(
                  `Order placed! Total: QAR ${calculateTotal().toFixed(2)} - Paid with ${selectedPaymentMethod}`,
                );
              }

              // Reset cart, dine-in info, and hold billing
              setCart([]);
              setDineInTableNumber("");
              setDineInCustomerName("");
              setHoldBilling(false);
            } catch (innerError) {
              console.error("Error in inner timeout:", innerError);
              setIsPrintingLabel(false);
              setCart([]);
              setDineInTableNumber("");
              setDineInCustomerName("");
              setHoldBilling(false);
            }
          }, 1500);
        } catch (outerError) {
          console.error("Error in outer timeout:", outerError);
          setIsPrintingReceipt(false);
          setIsPrintingLabel(false);
          setCart([]);
          setDineInTableNumber("");
          setDineInCustomerName("");
          setHoldBilling(false);
        }
      }, 1500);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
      setIsPrintingReceipt(false);
      setIsPrintingLabel(false);
    }
  };

  const formatOptionLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="flex h-full bg-background">
      {/* Menu Section */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">POS</h2>
          <p className="text-muted-foreground">Take customer orders</p>
        </div>

        {categories.length > 0 ? (
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="mb-4">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-0"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {itemsByCategory[category.id]?.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCartDirectly(item)}
                    >
                      <CardHeader className="p-4 pb-2">
                        {item.image && (
                          <div className="w-full h-24 mb-2 overflow-hidden rounded-md">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardTitle className="text-base">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-4">
                        <p className="text-lg font-semibold">
                          QAR {item.price.toFixed(2)}
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No menu items available. Add items in Menu Management.
            </p>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="w-[350px] border-l bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            <h3 className="text-lg font-semibold">Current Order</h3>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-4 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Cart is empty
              </p>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex justify-between items-start border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      QAR {(item.totalPrice / item.quantity).toFixed(2)} ×{" "}
                      {item.quantity}
                    </p>
                    {item.selectedOptions &&
                      Object.keys(item.selectedOptions).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(item.selectedOptions).map(
                            ([key, value]) => (
                              <div key={key}>
                                {formatOptionLabel(key)}:{" "}
                                <span className="font-medium">
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : value}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => removeFromCart(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => increaseCartItemQuantity(index)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Total</span>
            <span className="font-bold">QAR {calculateTotal().toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Checkout
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={cart.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsPreviousTransactionsOpen(true)}
              >
                Transaction History
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dine-In Dialog */}
      <Dialog open={isDineInDialogOpen} onOpenChange={setIsDineInDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dine-In Information</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {noTablesAvailableError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start mb-4">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">No tables available</p>
                  <p className="text-sm">
                    Please check Table Management to free up tables or add more
                    tables.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-number" className="text-right">
                Table Number
              </Label>
              <Select
                value={dineInTableNumber}
                onValueChange={setDineInTableNumber}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.length > 0 ? (
                    availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-tables" disabled>
                      No available tables. Please check Table Management.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="hold-billing"
                checked={holdBilling}
                onCheckedChange={(checked) =>
                  setHoldBilling(checked as boolean)
                }
              />
              <Label htmlFor="hold-billing">
                Hold billing (customer may order more items)
              </Label>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-name" className="text-right">
                Customer Name
              </Label>
              <Input
                id="customer-name"
                value={dineInCustomerName}
                onChange={(e) => setDineInCustomerName(e.target.value)}
                placeholder="Optional"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDineInDialogOpen(false);
                setSelectedPaymentMethod("");
                setIsPaymentDialogOpen(true);
              }}
            >
              Skip (Walk-in)
            </Button>
            <Button
              onClick={() => {
                if (availableTables.length === 0) {
                  setNoTablesAvailableError(true);
                  // Request tables again in case they've been updated
                  window.dispatchEvent(
                    new CustomEvent("request-available-tables"),
                  );
                  return;
                }

                if (!dineInTableNumber) {
                  alert("Please select a table for the dine-in order.");
                  return;
                }

                setIsDineInDialogOpen(false);
                setSelectedPaymentMethod("");
                setIsPaymentDialogOpen(true);
              }}
              disabled={!dineInTableNumber && availableTables.length > 0}
            >
              Confirm
            </Button>
            {availableTables.length === 0 && (
              <p className="text-xs text-amber-600 mt-2 w-full text-center">
                No tables available. Please check Table Management.
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            {dineInTableNumber && (
              <p className="text-sm text-muted-foreground">
                Table: {dineInTableNumber}{" "}
                {dineInCustomerName ? `- ${dineInCustomerName}` : ""}
              </p>
            )}
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="space-y-3"
            >
              <div
                className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedPaymentMethod("QLUB")}
              >
                <RadioGroupItem value="QLUB" id="payment-qlub" />
                <Label htmlFor="payment-qlub" className="flex-1 cursor-pointer">
                  QLUB
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedPaymentMethod("Cash")}
              >
                <RadioGroupItem value="Cash" id="payment-cash" />
                <Label htmlFor="payment-cash" className="flex-1 cursor-pointer">
                  Cash
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedPaymentMethod("Card")}
              >
                <RadioGroupItem value="Card" id="payment-card" />
                <Label htmlFor="payment-card" className="flex-1 cursor-pointer">
                  Credit/Debit Card
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePaymentComplete}>Process Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Printing Dialog */}
      <Dialog open={isPrintingReceipt} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Printing Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <Printer className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
            <p>Printing receipt...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Label Printing Dialog */}
      <Dialog open={isPrintingLabel} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Printing Labels</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <Printer className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
            <p>Printing item labels...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Previous Transactions Dialog */}
      <Dialog
        open={isPreviousTransactionsOpen}
        onOpenChange={setIsPreviousTransactionsOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              {previousTransactions.length > 0 ? (
                <div className="space-y-4">
                  {previousTransactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`border p-3 rounded-md hover:bg-muted/50 cursor-pointer ${selectedTransaction?.id === transaction.id ? "bg-muted/50 border-primary" : ""}`}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Order #{transaction.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleTimeString()} •
                            {transaction.tableNumber
                              ? `Table ${transaction.tableNumber}`
                              : "Walk-in"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {transaction.paymentMethod}
                          </p>
                          <p className="font-bold">
                            QAR {transaction.amount.toFixed(2)}
                          </p>
                          <div
                            className={
                              transaction.status === "completed"
                                ? "bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium"
                                : transaction.status === "voided"
                                  ? "bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-medium"
                                  : "bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium"
                            }
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </div>
                        </div>
                      </div>
                      {transaction.items && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {transaction.items.map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.quantity}× {item.name} (QAR{" "}
                              {item.price.toFixed(2)})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter className="flex justify-between">
            <div className="space-x-2">
              {selectedTransaction &&
                selectedTransaction.status === "completed" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsPreviousTransactionsOpen(false);
                        setTransactionToVoid(selectedTransaction);
                        setIsVoidDialogOpen(true);
                      }}
                    >
                      Void
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsPreviousTransactionsOpen(false);
                        setTransactionToVoid(selectedTransaction);
                        setIsRefundDialogOpen(true);
                      }}
                    >
                      Refund
                    </Button>
                  </>
                )}
              {selectedTransaction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPreviousTransactionsOpen(false);
                    setIsPrintingPreviousReceipt(true);
                    setTimeout(() => {
                      setIsPrintingPreviousReceipt(false);
                      alert(
                        `Receipt for order #${selectedTransaction.orderNumber} printed successfully!`,
                      );
                    }, 1500);
                  }}
                >
                  Print Receipt
                </Button>
              )}
            </div>
            <Button onClick={() => setIsPreviousTransactionsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Transaction Dialog */}
      <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Void Transaction</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="void-reason">Reason for Voiding</Label>
                <Input
                  id="void-reason"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Enter reason"
                  className="mt-1"
                />
              </div>
              {transactionToVoid && (
                <div className="border p-3 rounded-md bg-muted/50">
                  <p className="font-medium">
                    Order #{transactionToVoid.orderNumber}
                  </p>
                  <p className="text-sm">
                    Amount: QAR {transactionToVoid.amount.toFixed(2)}
                  </p>
                  <p className="text-sm">
                    Payment: {transactionToVoid.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVoidDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (transactionToVoid) {
                  if (!voidReason.trim()) {
                    alert("Please enter a reason for voiding the transaction");
                    return;
                  }

                  try {
                    // Update transaction in database
                    if (
                      transactionToVoid.id &&
                      !transactionToVoid.id.startsWith("tx-")
                    ) {
                      await updateTransactionStatus(
                        transactionToVoid.id,
                        "voided",
                        voidReason,
                      );
                    }

                    // Update transaction status in UI
                    setPreviousTransactions((prev) =>
                      prev.map((tx) =>
                        tx.id === transactionToVoid.id
                          ? {
                              ...tx,
                              status: "voided",
                              voidReason,
                              voidedAt: new Date(),
                            }
                          : tx,
                      ),
                    );

                    // Create a void transaction record for analytics
                    const voidTransaction = {
                      id: `void-${Date.now()}`,
                      orderNumber: `V-${transactionToVoid.orderNumber.replace(/^[A-Z]-/, "")}`,
                      date: new Date(),
                      amount: 0, // Zero amount for void
                      source: "pos",
                      status: "voided",
                      paymentMethod: transactionToVoid.paymentMethod,
                      items: [
                        {
                          name: `Void for order #${transactionToVoid.orderNumber}`,
                          quantity: 1,
                          price: 0,
                        },
                      ],
                      voidedOrderId: transactionToVoid.id,
                      voidReason: voidReason,
                    };

                    // Also dispatch to reports analytics
                    window.dispatchEvent(
                      new CustomEvent("new-analytics-transaction", {
                        detail: voidTransaction,
                      }),
                    );

                    setIsVoidDialogOpen(false);
                    setVoidReason("");
                    alert(
                      `Transaction #${transactionToVoid.orderNumber} has been voided.`,
                    );
                  } catch (error) {
                    console.error("Error voiding transaction:", error);
                    alert("Failed to void transaction. Please try again.");
                  }
                }
              }}
            >
              Void Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Transaction Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Transaction</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="refund-reason">Reason for Refund</Label>
                  <Input
                    id="refund-reason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refund-amount">Refund Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">QAR</span>
                    <Input
                      id="refund-amount"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-12 mt-1"
                      min="0"
                      max={transactionToVoid?.amount}
                    />
                  </div>
                  {transactionToVoid && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Max: QAR {transactionToVoid.amount.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="full-refund"
                    checked={
                      refundAmount ===
                      (transactionToVoid?.amount?.toString() || "")
                    }
                    onCheckedChange={(checked) => {
                      if (checked && transactionToVoid) {
                        setRefundAmount(transactionToVoid.amount.toString());
                      } else {
                        setRefundAmount("");
                      }
                    }}
                  />
                  <Label htmlFor="full-refund">Full refund</Label>
                </div>
              </div>
              {transactionToVoid && (
                <div className="border p-3 rounded-md bg-muted/50">
                  <p className="font-medium">
                    Order #{transactionToVoid.orderNumber}
                  </p>
                  <p className="text-sm">
                    Amount: QAR {transactionToVoid.amount.toFixed(2)}
                  </p>
                  <p className="text-sm">
                    Payment: {transactionToVoid.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (transactionToVoid) {
                  if (!refundAmount || parseFloat(refundAmount) <= 0) {
                    alert("Please enter a valid refund amount");
                    return;
                  }

                  const refundAmountNum = parseFloat(refundAmount);
                  if (refundAmountNum > transactionToVoid.amount) {
                    alert("Refund amount cannot exceed the transaction amount");
                    return;
                  }

                  try {
                    // Update transaction in database
                    if (
                      transactionToVoid.id &&
                      !transactionToVoid.id.startsWith("tx-")
                    ) {
                      await updateTransactionStatus(
                        transactionToVoid.id,
                        "refunded",
                        refundReason,
                      );

                      // Also update refund amount in database
                      await supabase
                        .from("transactions")
                        .update({ refund_amount: refundAmountNum })
                        .eq("id", transactionToVoid.id);
                    }

                    // Update transaction status in UI
                    setPreviousTransactions((prev) =>
                      prev.map((tx) =>
                        tx.id === transactionToVoid.id
                          ? {
                              ...tx,
                              status: "refunded",
                              refundReason,
                              refundAmount: refundAmountNum,
                              refundedAt: new Date(),
                            }
                          : tx,
                      ),
                    );

                    // Create a refund transaction record
                    const refundTransaction = {
                      id: `refund-${Date.now()}`,
                      orderNumber: `R-${transactionToVoid.orderNumber.replace(/^[A-Z]-/, "")}`,
                      date: new Date(),
                      amount: -refundAmountNum, // Negative amount for refund
                      source: "pos",
                      status: "completed",
                      paymentMethod: transactionToVoid.paymentMethod,
                      items: [
                        {
                          name: `Refund for order #${transactionToVoid.orderNumber}`,
                          quantity: 1,
                          price: -refundAmountNum,
                        },
                      ],
                      refundedOrderId: transactionToVoid.id,
                      refundReason: refundReason,
                    };

                    // Create refund transaction in database
                    await createTransaction({
                      orderNumber: refundTransaction.orderNumber,
                      amount: -refundAmountNum,
                      source: "pos",
                      status: "completed",
                      paymentMethod: transactionToVoid.paymentMethod,
                      orderType: "refund",
                      items: [
                        {
                          name: `Refund for order #${transactionToVoid.orderNumber}`,
                          quantity: 1,
                          price: -refundAmountNum,
                          type: "refund",
                        },
                      ],
                      createdBy: localStorage.getItem("userName") || "Unknown",
                      userId: localStorage.getItem("userId") || undefined,
                    });

                    // Add refund to transaction history
                    setPreviousTransactions((prev) => [
                      refundTransaction,
                      ...prev,
                    ]);

                    // Also dispatch to reports analytics
                    window.dispatchEvent(
                      new CustomEvent("new-analytics-transaction", {
                        detail: refundTransaction,
                      }),
                    );

                    setIsRefundDialogOpen(false);
                    setRefundReason("");
                    setRefundAmount("");
                    alert(
                      `Transaction #${transactionToVoid.orderNumber} has been refunded QAR ${refundAmountNum.toFixed(2)}.`,
                    );
                  } catch (error) {
                    console.error("Error processing refund:", error);
                    alert("Failed to process refund. Please try again.");
                  }
                }
              }}
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous Receipt Printing Dialog */}
      <Dialog open={isPrintingPreviousReceipt} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Printing Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <Printer className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
            <p>Printing receipt...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customization Dialog */}
      <Dialog
        open={isCustomizationDialogOpen}
        onOpenChange={setIsCustomizationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name} - Customize</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedItem?.customizationOptions &&
              Object.entries(selectedItem.customizationOptions).map(
                ([key, options]) => (
                  <div key={key} className="mb-4">
                    <h4 className="font-medium mb-2">
                      {formatOptionLabel(key)}
                    </h4>
                    {selectedItem?.customizationMultiSelect?.[key] ? (
                      <div className="space-y-2">
                        {options?.map((option) => {
                          const optionPrice =
                            selectedItem.customizationPrices?.[key]?.[option] ||
                            0;
                          const isSelected =
                            Array.isArray(customizationSelections[key]) &&
                            (customizationSelections[key] as string[]).includes(
                              option,
                            );

                          return (
                            <div
                              key={option}
                              className="flex items-center space-x-2 mb-1"
                            >
                              <Checkbox
                                id={`${key}-${option}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const currentSelections = [
                                    ...((customizationSelections[
                                      key
                                    ] as string[]) || []),
                                  ];
                                  if (checked) {
                                    currentSelections.push(option);
                                  } else {
                                    const index =
                                      currentSelections.indexOf(option);
                                    if (index > -1) {
                                      currentSelections.splice(index, 1);
                                    }
                                  }
                                  setCustomizationSelections((prev) => ({
                                    ...prev,
                                    [key]: currentSelections,
                                  }));
                                }}
                              />
                              <Label
                                htmlFor={`${key}-${option}`}
                                className="flex-1"
                              >
                                {option}
                              </Label>
                              {optionPrice > 0 && (
                                <span className="text-sm">
                                  +QAR {optionPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <RadioGroup
                        value={(customizationSelections[key] as string) || ""}
                        onValueChange={(value) => {
                          setCustomizationSelections({
                            ...customizationSelections,
                            [key]: value,
                          });
                        }}
                      >
                        {!selectedItem?.customizationRequired?.[key] && (
                          <div className="flex items-center space-x-2 mb-1">
                            <RadioGroupItem value="" id={`${key}-none`} />
                            <Label htmlFor={`${key}-none`} className="flex-1">
                              None
                            </Label>
                          </div>
                        )}
                        {options?.map((option) => {
                          const optionPrice =
                            selectedItem.customizationPrices?.[key]?.[option] ||
                            0;
                          return (
                            <div
                              key={option}
                              className="flex items-center space-x-2 mb-1"
                            >
                              <RadioGroupItem
                                value={option}
                                id={`${key}-${option}`}
                              />
                              <Label
                                htmlFor={`${key}-${option}`}
                                className="flex-1"
                              >
                                {option}
                              </Label>
                              {optionPrice > 0 && (
                                <span className="text-sm">
                                  +QAR {optionPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                  </div>
                ),
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomizationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addToCart}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSSystem;
