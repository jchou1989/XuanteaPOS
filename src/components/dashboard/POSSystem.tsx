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
  Search,
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
  // Add search functionality
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

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

    // Set up a periodic refresh of menu items every 5 minutes
    const menuRefreshInterval = setInterval(
      () => {
        if (menuContext) {
          console.log("POSSystem: Refreshing menu items...");
          menuContext.loadMenuItems().catch((error) => {
            console.error("POSSystem: Error refreshing menu items:", error);
          });
          // Also request menu items from MenuManagement
          window.dispatchEvent(new CustomEvent("request-menu-items"));
        }
      },
      5 * 60 * 1000, // 5 minutes
    );

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
        // Reset categories and itemsByCategory to force re-organization
        setCategories([]);
        setItemsByCategory({});
        setActiveCategory("");
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

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      setFilteredItems([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results = effectiveMenuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query),
    );
    setFilteredItems(results);
  }, [searchQuery, effectiveMenuItems]);

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
        // Request available tables again to ensure we have the latest data
        window.dispatchEvent(new CustomEvent("request-available-tables"));
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
        id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        orderNumber: orderNumber,
        source: "pos",
        status: "new",
        items: orderItems,
        timestamp: new Date().toISOString(),
        customerName: dineInCustomerName || "Walk-in Customer",
        tableNumber: dineInTableNumber || undefined,
        orderType: dineInTableNumber ? "dine-in" : "walk-in",
      };

      // Dispatch the order to the kitchen display system
      window.dispatchEvent(
        new CustomEvent("new-order", { detail: queueOrder }),
      );

      // Add transaction to previous transactions list
      setPreviousTransactions((prev) => [transaction, ...prev]);

      // Clear cart and reset state
      setCart([]);
      setDineInTableNumber("");
      setDineInCustomerName("");
      setHoldBilling(false);
      setIsPrintingReceipt(false);

      // Show success message
      alert(`Order #${orderNumber} completed successfully!`);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("An error occurred while processing payment. Please try again.");
      setIsPrintingReceipt(false);
    }
  };

  // Return the component UI here
  return (
    <div className="flex h-screen bg-white">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <h1></h1>
        </header>

        {/* Main POS area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Menu items section */}
          <div className="w-2/3 p-4 overflow-auto">
            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search menu items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs
              defaultValue={activeCategory || categories[0]?.id || ""}
              className="w-full"
            >
              <TabsList className="mb-4 flex overflow-x-auto">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className="px-4 py-2"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {isSearching ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToCartDirectly(item)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-cover w-full h-full rounded-md"
                              />
                            ) : (
                              <div className="text-gray-400">No image</div>
                            )}
                          </div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {item.description}
                          </p>
                          <p className="font-semibold mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>No items found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                Object.entries(itemsByCategory).map(([categoryId, items]) => (
                  <TabsContent
                    key={categoryId}
                    value={categoryId}
                    className="mt-0"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addToCartDirectly(item)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="object-cover w-full h-full rounded-md"
                                />
                              ) : (
                                <div className="text-gray-400">No image</div>
                              )}
                            </div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500 truncate">
                              {item.description}
                            </p>
                            <p className="font-semibold mt-1">
                              ${item.price.toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))
              )}
            </Tabs>
          </div>

          {/* Cart section */}
          <div className="w-1/3 border-l border-gray-200 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-1">Current Order</h2>
              <p className="text-sm text-gray-500">
                {cart.length === 0
                  ? "No items added"
                  : `${cart.length} item${cart.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-start bg-white p-3 rounded-md shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {item.selectedOptions &&
                          Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {Object.entries(item.selectedOptions).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span>{" "}
                                    {Array.isArray(value)
                                      ? value.join(", ")
                                      : value}
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => removeFromCart(index)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="mx-2 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => increaseCartItemQuantity(index)}
                          >
                            <Plus size={12} />
                          </Button>
                          <div className="ml-auto font-medium">
                            ${item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-1">Add items from the menu</p>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Tax (5%)</span>
                <span>${(calculateTotal() * 0.05).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between mb-4 font-semibold text-lg">
                <span>Total</span>
                <span>${(calculateTotal() * 1.05).toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Dialog */}
      <Dialog
        open={isCustomizationDialogOpen}
        onOpenChange={setIsCustomizationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize {selectedItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {selectedItem?.customizationOptions &&
              Object.entries(selectedItem.customizationOptions).map(
                ([key, options]) => {
                  const isRequired =
                    selectedItem.customizationRequired?.[key] || false;
                  const isMultiSelect =
                    selectedItem.customizationMultiSelect?.[key] || false;

                  return (
                    <div key={key} className="space-y-2">
                      <Label className="flex items-center">
                        {key}
                        {isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {isMultiSelect ? (
                        // Multi-select options (checkboxes)
                        <div className="space-y-2">
                          {options?.map((option) => (
                            <div
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${key}-${option}`}
                                checked={
                                  Array.isArray(customizationSelections[key]) &&
                                  (
                                    customizationSelections[key] as string[]
                                  ).includes(option)
                                }
                                onCheckedChange={(checked) => {
                                  setCustomizationSelections((prev) => {
                                    const currentSelections = Array.isArray(
                                      prev[key],
                                    )
                                      ? [...(prev[key] as string[])]
                                      : [];

                                    if (checked) {
                                      return {
                                        ...prev,
                                        [key]: [...currentSelections, option],
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        [key]: currentSelections.filter(
                                          (item) => item !== option,
                                        ),
                                      };
                                    }
                                  });
                                }}
                              />
                              <Label
                                htmlFor={`${key}-${option}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {option}
                                {selectedItem.customizationPrices?.[key]?.[
                                  option
                                ] > 0 &&
                                  ` (+${selectedItem.customizationPrices[key][option].toFixed(2)})`}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Single-select options (radio buttons)
                        <RadioGroup
                          value={(customizationSelections[key] as string) || ""}
                          onValueChange={(value) => {
                            setCustomizationSelections((prev) => ({
                              ...prev,
                              [key]: value,
                            }));
                          }}
                        >
                          {options?.map((option) => (
                            <div
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option}
                                id={`${key}-${option}`}
                              />
                              <Label
                                htmlFor={`${key}-${option}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {option}
                                {selectedItem.customizationPrices?.[key]?.[
                                  option
                                ] > 0 &&
                                  ` (+${selectedItem.customizationPrices[key][option].toFixed(2)})`}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  );
                },
              )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsCustomizationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addToCart}>
              Add to Order - $
              {selectedItem
                ? calculateItemPrice(
                    selectedItem,
                    customizationSelections,
                  ).toFixed(2)
                : "0.00"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold">
                ${(calculateTotal() * 1.05).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>

            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="cash" id="payment-cash" />
                  <Label htmlFor="payment-cash" className="cursor-pointer">
                    Cash
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="card" id="payment-card" />
                  <Label htmlFor="payment-card" className="cursor-pointer">
                    Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="mobile" id="payment-mobile" />
                  <Label htmlFor="payment-mobile" className="cursor-pointer">
                    Mobile Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="other" id="payment-other" />
                  <Label htmlFor="payment-other" className="cursor-pointer">
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentComplete}
              disabled={!selectedPaymentMethod}
            >
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dine-in Dialog */}
      <Dialog open={isDineInDialogOpen} onOpenChange={setIsDineInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Type</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label>Is this a dine-in order?</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={dineInTableNumber ? "default" : "outline"}
                  onClick={() => {
                    if (availableTables.length === 0) {
                      setNoTablesAvailableError(true);
                    } else {
                      setNoTablesAvailableError(false);
                      setDineInTableNumber(availableTables[0]?.name || "");
                    }
                  }}
                  className="w-full"
                >
                  Dine-in
                </Button>
                <Button
                  variant={!dineInTableNumber ? "default" : "outline"}
                  onClick={() => {
                    setDineInTableNumber("");
                    setDineInCustomerName("");
                    setNoTablesAvailableError(false);
                  }}
                  className="w-full"
                >
                  Walk-in
                </Button>
              </div>
            </div>

            {noTablesAvailableError && (
              <div className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                No tables available. Please add tables in Table Management.
              </div>
            )}

            {dineInTableNumber && (
              <div className="space-y-2">
                <Label>Select Table</Label>
                <Select
                  value={dineInTableNumber}
                  onValueChange={setDineInTableNumber}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.name}>
                        Table {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {dineInTableNumber && (
              <div className="space-y-2">
                <Label>Customer Name (Optional)</Label>
                <Input
                  value={dineInCustomerName}
                  onChange={(e) => setDineInCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
            )}

            {dineInTableNumber && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hold-billing"
                  checked={holdBilling}
                  onCheckedChange={(checked) => setHoldBilling(!!checked)}
                />
                <Label
                  htmlFor="hold-billing"
                  className="text-sm cursor-pointer"
                >
                  Hold billing until customer is ready to pay
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDineInDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsDineInDialogOpen(false);
                setSelectedPaymentMethod("");
                setIsPaymentDialogOpen(true);
              }}
              disabled={dineInTableNumber && noTablesAvailableError}
            >
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Printing Dialog */}
      <Dialog open={isPrintingReceipt} onOpenChange={setIsPrintingReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Printing Receipt</DialogTitle>
          </DialogHeader>

          <div className="py-8 text-center">
            <Printer className="h-16 w-16 mx-auto text-gray-400 animate-pulse mb-4" />
            <p>Printing receipt...</p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few seconds
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsPrintingReceipt(false)}
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSSystem;
