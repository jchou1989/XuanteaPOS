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
    <div className="bg-white">
      {/* Component UI would go here */}
      <div>POS System Component</div>
    </div>
  );
};

export default POSSystem;
