import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import BluetoothSettings from "./BluetoothSettings";
import {
  Bluetooth,
  Printer,
  CreditCard,
  Wifi,
  Bell,
  Shield,
  Users,
} from "lucide-react";

const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("bluetooth");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-8">
          <TabsTrigger
            value="bluetooth"
            className="flex flex-col items-center py-3"
          >
            <Bluetooth className="h-5 w-5 mb-1" />
            <span>Bluetooth</span>
          </TabsTrigger>
          <TabsTrigger
            value="printers"
            className="flex flex-col items-center py-3"
          >
            <Printer className="h-5 w-5 mb-1" />
            <span>Printers</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="flex flex-col items-center py-3"
          >
            <CreditCard className="h-5 w-5 mb-1" />
            <span>Payment</span>
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="flex flex-col items-center py-3"
          >
            <Wifi className="h-5 w-5 mb-1" />
            <span>Network</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex flex-col items-center py-3"
          >
            <Bell className="h-5 w-5 mb-1" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex flex-col items-center py-3"
          >
            <Shield className="h-5 w-5 mb-1" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex flex-col items-center py-3"
          >
            <Users className="h-5 w-5 mb-1" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bluetooth">
          <BluetoothSettings />
        </TabsContent>

        <TabsContent value="printers">
          <div className="p-6 text-center text-muted-foreground">
            Printer settings will be implemented soon.
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="p-6 text-center text-muted-foreground">
            Payment settings will be implemented soon.
          </div>
        </TabsContent>

        <TabsContent value="network">
          <div className="p-6 text-center text-muted-foreground">
            Network settings will be implemented soon.
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="p-6 text-center text-muted-foreground">
            Notification settings will be implemented soon.
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="p-6 text-center text-muted-foreground">
            Security settings will be implemented soon.
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="p-6 text-center text-muted-foreground">
            User management will be implemented soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsLayout;
