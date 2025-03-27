import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./dashboard/Sidebar";
import OrderQueuePanel from "./dashboard/OrderQueuePanel";
import MenuManagement from "./dashboard/MenuManagement";
import ReportsAnalytics from "./dashboard/ReportsAnalytics";
import POSSystem from "./dashboard/POSSystem";
import DeliveryIntegrations from "./dashboard/DeliveryIntegrations";
import TableManagement from "./dashboard/TableManagement";
import PrinterSettings from "./dashboard/PrinterSettings";
import PaymentIntegration from "./dashboard/PaymentIntegration";
import InventoryManagement from "./dashboard/InventoryManagement";
import ConnectedDevices from "./dashboard/ConnectedDevices";
import KitchenDisplay from "./dashboard/KitchenDisplay";
import iPadPOS from "./dashboard/iPadPOS";
import CDSInterface from "./dashboard/CDSInterface";
import WiFiSettings from "./dashboard/WiFiSettings";
import BluetoothSettings from "./settings/BluetoothSettings";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Printer,
  Truck,
  CreditCard,
  Package,
  Tablet,
  Wifi,
  Bluetooth,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  preparationNotes?: string;
  image?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState("orders");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Store Manager");
  const [userAvatar, setUserAvatar] = useState("");

  // Check for page parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get("page");
    if (pageParam) {
      setActivePage(pageParam);
    }
  }, [location]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        // Handle preview mode or errors
        if (error || !data.session) {
          if (import.meta.env.VITE_TEMPO === "true") {
            // In preview mode, use default values and continue
            setUserName("Demo User");
            setUserRole("Store Manager");
            setUserAvatar(
              `https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser`,
            );
            return; // Don't navigate away in preview mode
          } else {
            // In production, redirect to landing
            navigate("/landing");
            return;
          }
        }

        // Get user info from localStorage or fetch from database
        const storedName = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("userEmail");
        const userId = localStorage.getItem("userId") || data.session?.user?.id;

        // Store user ID if available from session
        if (data.session?.user?.id && !localStorage.getItem("userId")) {
          localStorage.setItem("userId", data.session.user.id);
        }

        // Store email if available from session
        if (data.session?.user?.email && !localStorage.getItem("userEmail")) {
          localStorage.setItem("userEmail", data.session.user.email);
        }

        if (storedName) {
          setUserName(storedName);
          // Generate avatar based on name
          setUserAvatar(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(storedName)}`,
          );
        } else if (userId) {
          try {
            // Fetch user info from database
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name, email, role")
              .eq("id", userId)
              .single();

            if (userError) throw userError;

            if (userData) {
              const displayName =
                userData.name || userData.email?.split("@")[0] || "User";
              setUserName(displayName);
              if (userData.role) setUserRole(userData.role);
              localStorage.setItem("userName", displayName);
              setUserAvatar(
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name || userData.email || "User")}`,
              );
            }
          } catch (userFetchError) {
            console.error("Error fetching user data:", userFetchError);
            // Use email from session as fallback
            if (data.session?.user?.email) {
              const name = data.session.user.email.split("@")[0];
              setUserName(name);
              localStorage.setItem("userName", name);
              setUserAvatar(
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
              );
            }
          }
        } else if (storedEmail || data.session?.user?.email) {
          const email = storedEmail || data.session?.user?.email || "";
          const name = email.split("@")[0];
          setUserName(name);
          localStorage.setItem("userName", name);
          setUserAvatar(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          );
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        if (import.meta.env.VITE_TEMPO === "true") {
          // In preview mode, use default values
          setUserName("Demo User");
          setUserRole("Store Manager");
          setUserAvatar(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser`,
          );
        } else {
          navigate("/landing");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // Initialize with empty menu items - will be populated from MenuManagement
  useEffect(() => {
    const loadMenuItems = () => {
      // Load from localStorage if available
      const savedItems = localStorage.getItem("menuItems");
      if (savedItems) {
        try {
          const parsedItems = JSON.parse(savedItems);
          setItems(parsedItems);
        } catch (error) {
          console.error("Error parsing saved menu items:", error);
          setItems([]);
        }
      }
    };

    loadMenuItems();

    // Listen for menu updates
    const handleMenuUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setItems(event.detail);
      }
    };

    window.addEventListener(
      "menu-items-updated" as any,
      handleMenuUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "menu-items-updated" as any,
        handleMenuUpdate as EventListener,
      );
    };
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    // Update URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
  };

  // Check for CDS device info in localStorage
  useEffect(() => {
    const cdsDeviceId = localStorage.getItem("cdsDeviceId");
    const cdsDeviceName = localStorage.getItem("cdsDeviceName");

    // If we have CDS device info and the page is cds-interface, set active page
    if (cdsDeviceId && cdsDeviceName && activePage === "cds-interface") {
      setActivePage("cds-interface");
    }
  }, [activePage]);

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activePage === "orders" && <OrderQueuePanel />}
        {activePage === "pos" && <POSSystem menuItems={items} />}
        {activePage === "menu" && <MenuManagement />}
        {activePage === "reports" && <ReportsAnalytics />}
        {activePage === "tables" && <TableManagement />}
        {activePage === "cds-interface" && (
          <CDSInterface
            deviceName={localStorage.getItem("cdsDeviceName") || "iPad 1"}
            deviceId={localStorage.getItem("cdsDeviceId") || "ipad-1"}
            userId={localStorage.getItem("userId") || undefined}
          />
        )}
        {activePage === "settings" && (
          <div className="container mx-auto py-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-muted-foreground">
                System settings and configuration
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("printer-settings")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-primary" />
                    <CardTitle>Printer Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure printers for receipts, labels, and kitchen orders
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("integrations")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <CardTitle>Delivery Integrations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage integrations with delivery platforms
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("payment-integration")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <CardTitle>Payment Processing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure payment gateways and processing options
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("inventory")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>Inventory Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track and manage inventory levels
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("devices")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Tablet className="h-5 w-5 text-primary" />
                    <CardTitle>Connected Devices</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage iPads, kitchen displays, and other connected devices
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("wifi-settings")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-primary" />
                    <CardTitle>WiFi Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure WiFi networks and connection preferences
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNavigate("bluetooth-settings")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bluetooth className="h-5 w-5 text-primary" />
                    <CardTitle>Bluetooth Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage Bluetooth devices and connection preferences
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {activePage === "printer-settings" && <PrinterSettings />}
        {activePage === "integrations" && <DeliveryIntegrations />}
        {activePage === "payment-integration" && <PaymentIntegration />}
        {activePage === "inventory" && <InventoryManagement />}
        {activePage === "devices" && <ConnectedDevices />}
        {activePage === "kitchen-display" && <KitchenDisplay />}
        {activePage === "ipad-pos" && (
          <div className="container mx-auto py-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">iPad POS Integration</h2>
              <p className="text-muted-foreground">
                Manage connected iPads and synchronize orders across devices
              </p>
            </div>
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-muted-foreground">
                iPad POS integration is currently under development.
              </p>
            </div>
          </div>
        )}
        {activePage === "wifi-settings" && <WiFiSettings />}
        {activePage === "bluetooth-settings" && <BluetoothSettings />}
      </div>
    </div>
  );
};

export default Home;
