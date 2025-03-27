import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Printer,
  CreditCard,
  Truck,
  Package,
  Tablet,
  Settings,
  Users,
  Bell,
  Globe,
  Mail,
} from "lucide-react";

const SettingsPanel = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Configure system preferences and manage integrations
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users & Permissions
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure general system settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the application interface
                  </p>
                </div>
                <Switch id="dark-mode" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-logout">Auto Logout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after period of inactivity
                  </p>
                </div>
                <Switch id="auto-logout" defaultChecked />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeout" className="text-right">
                  Timeout (minutes)
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  defaultValue="30"
                  min="5"
                  className="col-span-3"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language
                  </p>
                </div>
                <select
                  id="language"
                  className="flex h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="currency">Currency</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred currency
                  </p>
                </div>
                <select
                  id="currency"
                  className="flex h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="qar">QAR (Qatari Riyal)</option>
                  <option value="usd">USD (US Dollar)</option>
                  <option value="eur">EUR (Euro)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business-name" className="text-right">
                  Business Name
                </Label>
                <Input
                  id="business-name"
                  defaultValue="Xuan Tea"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business-address" className="text-right">
                  Address
                </Label>
                <Input
                  id="business-address"
                  defaultValue="123 Al Waab Street"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="business-phone"
                  defaultValue="+974 1234 5678"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="business-email"
                  defaultValue="info@xuantea.com"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax-id" className="text-right">
                  Tax ID
                </Label>
                <Input
                  id="tax-id"
                  defaultValue="QA123456789"
                  className="col-span-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-order">New Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new orders are placed
                  </p>
                </div>
                <Switch id="new-order" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-status">Order Status Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when order status changes
                  </p>
                </div>
                <Switch id="order-status" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inventory-alerts">Inventory Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when inventory is low
                  </p>
                </div>
                <Switch id="inventory-alerts" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch id="email-notifications" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notification-email" className="text-right">
                  Email Address
                </Label>
                <Input
                  id="notification-email"
                  type="email"
                  defaultValue="manager@xuantea.com"
                  className="col-span-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Name
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Email
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Role
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Admin User</td>
                        <td className="p-4 align-middle">admin@xuantea.com</td>
                        <td className="p-4 align-middle">
                          <Badge>Administrator</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Manager</td>
                        <td className="p-4 align-middle">
                          manager@xuantea.com
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">Manager</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 align-middle">Cashier</td>
                        <td className="p-4 align-middle">
                          cashier@xuantea.com
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">Staff</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button className="mt-4">
                  <Users className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Configure access levels for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Permission
                        </th>
                        <th className="h-10 px-4 text-center align-middle font-medium">
                          Administrator
                        </th>
                        <th className="h-10 px-4 text-center align-middle font-medium">
                          Manager
                        </th>
                        <th className="h-10 px-4 text-center align-middle font-medium">
                          Staff
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 align-middle">View Orders</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">✓</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Manage Orders</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">✓</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Manage Menu</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle">View Reports</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Manage Users</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">-</td>
                        <td className="p-4 align-middle text-center">-</td>
                      </tr>
                      <tr>
                        <td className="p-4 align-middle">System Settings</td>
                        <td className="p-4 align-middle text-center">✓</td>
                        <td className="p-4 align-middle text-center">-</td>
                        <td className="p-4 align-middle text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button variant="outline" className="mt-4">
                  Edit Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
              <CardDescription>
                Configure payment gateways and processing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Credit Card Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Accept credit and debit card payments
                    </p>
                  </div>
                </div>
                <Switch id="credit-card" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=talabat"
                    alt="Talabat"
                    className="h-8 w-8"
                  />
                  <div>
                    <h3 className="font-medium">Talabat Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with Talabat delivery service
                    </p>
                  </div>
                </div>
                <Switch id="talabat" defaultChecked />
              </div>

              <div className="pl-12 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="talabat-api" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="talabat-api"
                    type="password"
                    value="••••••••••••••••"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="talabat-id" className="text-right">
                    Merchant ID
                  </Label>
                  <Input
                    id="talabat-id"
                    defaultValue="TLB12345"
                    className="col-span-3"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=snoonu"
                    alt="Snoonu"
                    className="h-8 w-8"
                  />
                  <div>
                    <h3 className="font-medium">Snoonu Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with Snoonu delivery service
                    </p>
                  </div>
                </div>
                <Switch id="snoonu" defaultChecked />
              </div>

              <div className="pl-12 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="snoonu-api" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="snoonu-api"
                    type="password"
                    value="••••••••••••••••"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="snoonu-id" className="text-right">
                    Merchant ID
                  </Label>
                  <Input
                    id="snoonu-id"
                    defaultValue="SNU98765"
                    className="col-span-3"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=deliveroo"
                    alt="Deliveroo"
                    className="h-8 w-8"
                  />
                  <div>
                    <h3 className="font-medium">Deliveroo Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with Deliveroo delivery service
                    </p>
                  </div>
                </div>
                <Switch id="deliveroo" defaultChecked />
              </div>

              <div className="pl-12 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveroo-api" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="deliveroo-api"
                    type="password"
                    value="••••••••••••••••"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveroo-id" className="text-right">
                    Merchant ID
                  </Label>
                  <Input
                    id="deliveroo-id"
                    defaultValue="DLV54321"
                    className="col-span-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hardware Integrations</CardTitle>
              <CardDescription>
                Configure connected devices and hardware
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Printer className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Receipt Printer</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure receipt printer settings
                    </p>
                  </div>
                </div>
                <Switch id="receipt-printer" defaultChecked />
              </div>

              <div className="pl-12 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="printer-model" className="text-right">
                    Printer Model
                  </Label>
                  <Input
                    id="printer-model"
                    defaultValue="Epson TM-T88VI"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="printer-ip" className="text-right">
                    IP Address
                  </Label>
                  <Input
                    id="printer-ip"
                    defaultValue="192.168.1.100"
                    className="col-span-3"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Tablet className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">iPad POS Devices</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage connected iPad POS devices
                    </p>
                  </div>
                </div>
                <Switch id="ipad-pos" defaultChecked />
              </div>

              <div className="pl-12 space-y-4">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Device Name
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Location
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium">
                          Status
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Counter1</td>
                        <td className="p-4 align-middle">Front Counter</td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Online
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle">Counter2</td>
                        <td className="p-4 align-middle">Side Counter</td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Online
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 align-middle">Manager</td>
                        <td className="p-4 align-middle">Office</td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200"
                          >
                            Offline
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button variant="outline">
                  <Tablet className="mr-2 h-4 w-4" />
                  Add New Device
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
