import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

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

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuContextType {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (category: MenuCategory) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  loadMenuItems: () => Promise<void>;
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function useMenuData() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuData must be used within a MenuProvider");
  }
  return context;
}

interface MenuProviderProps {
  children: ReactNode;
}

export function MenuProvider({ children }: MenuProviderProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load menu items from localStorage or use sample data
  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      console.log("Loading menu items...");

      // Try to load from Supabase first with retry logic
      let attempts = 0;
      let data = null;
      let error = null;

      while (attempts < 3) {
        try {
          // Check if menu_items table exists first
          const { data: tableExists } = await supabase
            .from("information_schema.tables")
            .select("table_name")
            .eq("table_name", "menu_items")
            .single();

          // If table exists, query it
          let result;
          if (tableExists) {
            result = await supabase.from("menu_items").select("*");
          } else {
            // Table doesn't exist yet
            result = { data: null, error: { message: "Table does not exist" } };
          }
          data = result.data;
          error = result.error;
          if (!error) break;

          console.warn(`Supabase fetch attempt ${attempts + 1} failed:`, error);
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        } catch (fetchError) {
          console.error(`Fetch attempt ${attempts + 1} error:`, fetchError);
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      if (error) {
        console.error("Supabase error after retries:", error);
        // Continue to fallback instead of throwing
      }

      if (data && data.length > 0) {
        console.log("Loaded menu items from Supabase:", data.length);
        // Transform the data to match our MenuItem interface
        const transformedData = data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          type: item.type as "beverage" | "food",
          category: item.category || undefined,
          customizationOptions: item.customization_options || undefined,
          customizationPrices: item.customization_prices || undefined,
          customizationRequired: item.customization_required || undefined,
          customizationMultiSelect:
            item.customization_multi_select || undefined,
          preparationNotes: item.preparation_notes || undefined,
          image: item.image || undefined,
        }));

        setMenuItems(transformedData);
        localStorage.setItem("menuItems", JSON.stringify(data));

        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("menu-items-updated", { detail: data }),
        );
        return;
      }

      // If no data in Supabase, try localStorage
      const savedItems = localStorage.getItem("menuItems");
      const savedCategories = localStorage.getItem("menuCategories");

      if (savedItems) {
        try {
          const parsedItems = JSON.parse(savedItems) as MenuItem[];
          console.log(
            "Loaded menu items from localStorage:",
            parsedItems.length,
          );
          setMenuItems(parsedItems);

          // Dispatch event to notify other components
          window.dispatchEvent(
            new CustomEvent("menu-items-updated", { detail: parsedItems }),
          );
        } catch (error) {
          console.error("Error parsing saved menu items:", error);
        }
      }

      if (savedCategories) {
        try {
          setCategories(JSON.parse(savedCategories));
        } catch (error) {
          console.error("Error parsing saved categories:", error);
        }
      }

      // If still no menu items, use sample data
      if (!savedItems || JSON.parse(savedItems).length === 0) {
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
            image:
              "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGdyZWVuJTIwdGVhfGVufDB8fDB8fHww",
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
            image:
              "https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pbGslMjB0ZWF8ZW58MHx8MHx8fDA%3D",
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
            image:
              "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hdGNoYSUyMGxhdHRlfGVufDB8fDB8fHww",
          },
          {
            id: "4",
            name: "Pork Bao Bun",
            price: 3.99,
            description: "Steamed bun filled with savory pork",
            type: "food",
            category: "Snacks",
            image:
              "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFvJTIwYnVufGVufDB8fDB8fHww",
          },
          {
            id: "5",
            name: "Egg Tart",
            price: 2.99,
            description: "Flaky pastry with sweet egg custard filling",
            type: "food",
            category: "Snacks",
            image:
              "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnJTIwdGFydHxlbnwwfHwwfHx8MA%3D%3D",
          },
          {
            id: "6",
            name: "Scallion Pancake",
            price: 4.49,
            description: "Crispy savory pancake with scallions",
            type: "food",
            category: "Snacks",
            image:
              "https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2NhbGxpb24lMjBwYW5jYWtlfGVufDB8fDB8fHww",
          },
        ];

        console.log("Using sample menu items:", sampleMenuItems.length);
        setMenuItems(sampleMenuItems);
        localStorage.setItem("menuItems", JSON.stringify(sampleMenuItems));

        // Dispatch event to notify other components
        window.dispatchEvent(
          new CustomEvent("menu-items-updated", { detail: sampleMenuItems }),
        );

        // Try to save sample data to Supabase for future use
        try {
          // Format sample menu items to match expected structure
          const formattedSampleItems = sampleMenuItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            type: item.type,
            category: item.category || null,
            customization_options: item.customizationOptions || null,
            customization_prices: item.customizationPrices || null,
            customization_required: item.customizationRequired || null,
            customization_multi_select: item.customizationMultiSelect || null,
            preparation_notes: item.preparationNotes || null,
            image: item.image || null,
          }));

          await supabase
            .from("menu_items")
            .upsert(formattedSampleItems, { onConflict: "id" });
        } catch (insertError) {
          console.error(
            "Error saving sample menu items to Supabase:",
            insertError,
          );
        }
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    loadMenuItems();

    // Set up event listener for menu item requests
    const handleMenuItemRequest = () => {
      console.log("Menu items requested, dispatching current items");
      window.dispatchEvent(
        new CustomEvent("menu-items-updated", { detail: menuItems }),
      );
    };

    window.addEventListener("request-menu-items", handleMenuItemRequest);

    // Broadcast menu items immediately on mount to ensure all components have the latest data
    setTimeout(() => {
      console.log("Broadcasting initial menu items to all components");
      window.dispatchEvent(
        new CustomEvent("menu-items-updated", { detail: menuItems }),
      );
    }, 500);

    return () => {
      window.removeEventListener("request-menu-items", handleMenuItemRequest);
    };
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem("menuItems", JSON.stringify(menuItems));

      // Dispatch event to notify components that menu items have changed
      console.log(
        "Menu items updated, broadcasting to all components",
        menuItems.length,
      );
      window.dispatchEvent(
        new CustomEvent("menu-items-updated", { detail: menuItems }),
      );

      // Also try to save to Supabase if available
      try {
        const saveToSupabase = async () => {
          // Create a menu_items table if it doesn't exist yet
          try {
            // First try to create the table if it doesn't exist
            await supabase.rpc("create_menu_items_if_not_exists");
          } catch (e) {
            console.log(
              "Menu items table may already exist or RPC not available",
            );
          }

          // Format menu items to match expected structure
          const formattedMenuItems = menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            type: item.type,
            category: item.category || null,
            customization_options: item.customizationOptions || null,
            customization_prices: item.customizationPrices || null,
            customization_required: item.customizationRequired || null,
            customization_multi_select: item.customizationMultiSelect || null,
            preparation_notes: item.preparationNotes || null,
            image: item.image || null,
          }));

          // Use upsert instead of delete and insert
          const { error } = await supabase
            .from("menu_items")
            .upsert(formattedMenuItems, { onConflict: "id" });
          if (error) {
            console.error("Error saving menu items to Supabase:", error);
          } else {
            console.log("Menu items successfully saved to Supabase");
          }
        };
        saveToSupabase();
      } catch (error) {
        console.error("Error saving menu items to Supabase:", error);
      }
    }
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("menuCategories", JSON.stringify(categories));
  }, [categories]);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [...prev, item]);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addCategory = (category: MenuCategory) => {
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name } : cat)),
    );

    // Also update category name in all menu items that use this category
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.category === categories.find((c) => c.id === id)?.name) {
          return { ...item, category: name };
        }
        return item;
      }),
    );
  };

  const deleteCategory = (id: string) => {
    const categoryName = categories.find((c) => c.id === id)?.name;
    setCategories((prev) => prev.filter((cat) => cat.id !== id));

    // Set category to undefined for all items in this category
    if (categoryName) {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.category === categoryName) {
            const { category, ...rest } = item;
            return { ...rest, category: undefined };
          }
          return item;
        }),
      );
    }
  };

  const value = {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
    loadMenuItems,
    isLoading,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
