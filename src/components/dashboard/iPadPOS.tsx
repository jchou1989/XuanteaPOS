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
import { Separator } from "../ui/separator";
import {
  CreditCard,
  Printer,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Tablet,
  QrCode,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import POSSystem from "./POSSystem";

interface ConnectedDevice {
  id: string;
  name: string;
  type: "iPad" | "Android" | "KitchenDisplay";
  status: "online" | "offline";
  lastSeen: Date;
  ipAddress: string;
  location?: string;
}

interface iPadPOSProps {
  initialDevices?: ConnectedDevice[];
}

const iPadPOS = ({ initialDevices = [] }: iPadPOSProps) => {
  const [devices, setDevices] = useState<ConnectedDevice[]>(
    initialDevices.length > 0
      ? initialDevices
      : [
          {
            id: "1",
            name: "Front Counter iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.101",
            location: "Front Counter",
          },
          {
            id: "2",
            name: "Manager's iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.102",
            location: "Office",
          },
          {
            id: "3",
            name: "Kitchen Display",
            type: "KitchenDisplay",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.103",
            location: "Kitchen",
          },
          {
            id: "4",
            name: "Barista iPad",
            type: "iPad",
            status: "offline",
            lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
            ipAddress: "192.168.1.104",
            location: "Beverage Station",
          },
          {
            id: "5",
            name: "Outdoor Patio iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.105",
            location: "Outdoor Patio",
          },
          {
            id: "6",
            name: "Drive-Thru iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.106",
            location: "Drive-Thru Window",
          },
          {
            id: "7",
            name: "Takeout Counter iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.107",
            location: "Takeout Counter",
          },
          {
            id: "8",
            name: "Bar iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.108",
            location: "Bar Area",
          },
          {
            id: "9",
            name: "Host Stand iPad",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.109",
            location: "Front Entrance",
          },
          {
            id: "10",
            name: "Secondary Kitchen Display",
            type: "KitchenDisplay",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.110",
            location: "Secondary Kitchen",
          },
          {
            id: "11",
            name: "Beverage Station Display",
            type: "KitchenDisplay",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.111",
            location: "Beverage Station",
          },
          {
            id: "12",
            name: "Server iPad 1",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.112",
            location: "Dining Area",
          },
          {
            id: "13",
            name: "Server iPad 2",
            type: "iPad",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.113",
            location: "Dining Area",
          },
          {
            id: "14",
            name: "Server iPad 3",
            type: "iPad",
            status: "offline",
            lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
            ipAddress: "192.168.1.114",
            location: "Dining Area",
          },
          {
            id: "15",
            name: "Manager's Android Tablet",
            type: "Android",
            status: "online",
            lastSeen: new Date(),
            ipAddress: "192.168.1.115",
            location: "Office",
          },
        ],
  );

  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceType, setNewDeviceType] = useState<
    "iPad" | "Android" | "KitchenDisplay"
  >("iPad");
  const [newDeviceLocation, setNewDeviceLocation] = useState("");
  const [newDeviceIP, setNewDeviceIP] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(
    null,
  );
  const [isDeviceDetailsOpen, setIsDeviceDetailsOpen] = useState(false);
  const [orderSyncEnabled, setOrderSyncEnabled] = useState(true);
  const [menuSyncEnabled, setMenuSyncEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [showPOSTerminal, setShowPOSTerminal] = useState(false);

  const handleAddDevice = () => {
    if (!newDeviceName || !newDeviceIP) return;

    const newDevice: ConnectedDevice = {
      id: Date.now().toString(),
      name: newDeviceName,
      type: newDeviceType,
      status: "offline", // New devices start as offline until they connect
      lastSeen: new Date(),
      ipAddress: newDeviceIP,
      location: newDeviceLocation || undefined,
    };

    setDevices([...devices, newDevice]);
    setIsAddDeviceDialogOpen(false);
    resetNewDeviceForm();
  };

  const resetNewDeviceForm = () => {
    setNewDeviceName("");
    setNewDeviceType("iPad");
    setNewDeviceLocation("");
    setNewDeviceIP("");
  };

  const handleDeviceClick = (device: ConnectedDevice) => {
    setSelectedDevice(device);
    setIsDeviceDetailsOpen(true);
  };

  const toggleDeviceStatus = (deviceId: string) => {
    setDevices((prevDevices) =>
      prevDevices.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              status: device.status === "online" ? "offline" : "online",
              lastSeen:
                device.status === "offline" ? new Date() : device.lastSeen,
            }
          : device,
      ),
    );
  };

  const removeDevice = (deviceId: string) => {
    setDevices((prevDevices) =>
      prevDevices.filter((device) => device.id !== deviceId),
    );
    if (selectedDevice?.id === deviceId) {
      setIsDeviceDetailsOpen(false);
    }
  };

  const getStatusBadge = (status: "online" | "offline") => {
    return status === "online" ? (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <Wifi className="h-3 w-3" /> Online
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-800 flex items-center gap-1"
      >
        <WifiOff className="h-3 w-3" /> Offline
      </Badge>
    );
  };

  const getDeviceTypeIcon = (type: "iPad" | "Android" | "KitchenDisplay") => {
    switch (type) {
      case "iPad":
      case "Android":
        return <Tablet className="h-5 w-5 text-primary" />;
      case "KitchenDisplay":
        return <QrCode className="h-5 w-5 text-primary" />;
      default:
        return <Tablet className="h-5 w-5 text-primary" />;
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">iPad POS Integration</h2>
          <p className="text-muted-foreground">
            Manage connected iPads and synchronize orders across devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPOSTerminal(!showPOSTerminal)}
            variant={showPOSTerminal ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Tablet className="h-4 w-4" />
            {showPOSTerminal ? "Hide POS Terminal" : "Show POS Terminal"}
          </Button>
          <Button
            onClick={() => setIsAddDeviceDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {showPOSTerminal && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tablet className="h-5 w-5 text-primary" />
              iPad POS Terminal Preview
            </CardTitle>
            <CardDescription>
              This is how the POS terminal appears on connected iPads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <POSSystem />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Manage iPads, tablets, and kitchen displays connected to your
                POS system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleDeviceClick(device)}
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceTypeIcon(device.type)}
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.location} • {device.ipAddress}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        Last seen: {formatLastSeen(device.lastSeen)}
                      </div>
                      {getStatusBadge(device.status)}
                    </div>
                  </div>
                ))}

                {devices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tablet className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No devices connected</p>
                    <Button
                      variant="link"
                      onClick={() => setIsAddDeviceDialogOpen(true)}
                      className="mt-2"
                    >
                      Add your first device
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Synchronization</CardTitle>
              <CardDescription>
                Configure data synchronization between devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="order-sync">Order Synchronization</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync orders across all connected devices
                    </p>
                  </div>
                  <Switch
                    id="order-sync"
                    checked={orderSyncEnabled}
                    onCheckedChange={setOrderSyncEnabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="menu-sync">Menu Synchronization</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep menu items and prices in sync
                    </p>
                  </div>
                  <Switch
                    id="menu-sync"
                    checked={menuSyncEnabled}
                    onCheckedChange={setMenuSyncEnabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-update">Automatic Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically update POS software on devices
                    </p>
                  </div>
                  <Switch
                    id="auto-update"
                    checked={autoUpdateEnabled}
                    onCheckedChange={setAutoUpdateEnabled}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync All Devices Now
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Order Integration</CardTitle>
              <CardDescription>
                Configure how orders flow between systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">iPad POS</div>
                      <div className="text-sm text-muted-foreground">
                        {
                          devices.filter(
                            (d) =>
                              d.status === "online" &&
                              (d.type === "iPad" || d.type === "Android"),
                          ).length
                        }{" "}
                        devices online
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Connected
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Kitchen Display</div>
                      <div className="text-sm text-muted-foreground">
                        {
                          devices.filter(
                            (d) =>
                              d.status === "online" &&
                              d.type === "KitchenDisplay",
                          ).length
                        }{" "}
                        displays online
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Device Dialog */}
      <Dialog
        open={isAddDeviceDialogOpen}
        onOpenChange={setIsAddDeviceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Connect a new iPad, tablet, or kitchen display to your POS system
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                placeholder="e.g., Front Counter iPad"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="device-type">Device Type</Label>
              <select
                id="device-type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newDeviceType}
                onChange={(e) =>
                  setNewDeviceType(
                    e.target.value as "iPad" | "Android" | "KitchenDisplay",
                  )
                }
              >
                <option value="iPad">iPad</option>
                <option value="Android">Android Tablet</option>
                <option value="KitchenDisplay">Kitchen Display</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="device-location">Location (Optional)</Label>
              <Input
                id="device-location"
                placeholder="e.g., Front Counter"
                value={newDeviceLocation}
                onChange={(e) => setNewDeviceLocation(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="device-ip">IP Address</Label>
              <Input
                id="device-ip"
                placeholder="e.g., 192.168.1.100"
                value={newDeviceIP}
                onChange={(e) => setNewDeviceIP(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDeviceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddDevice}>Add Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Device Details Dialog */}
      <Dialog open={isDeviceDetailsOpen} onOpenChange={setIsDeviceDetailsOpen}>
        {selectedDevice && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getDeviceTypeIcon(selectedDevice.type)}
                {selectedDevice.name}
              </DialogTitle>
              <DialogDescription>
                Device details and management options
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                {getStatusBadge(selectedDevice.status)}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Type</span>
                  <p>{selectedDevice.type}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    IP Address
                  </span>
                  <p>{selectedDevice.ipAddress}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Location
                  </span>
                  <p>{selectedDevice.location || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Last Seen
                  </span>
                  <p>{formatLastSeen(selectedDevice.lastSeen)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Device Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDeviceStatus(selectedDevice.id)}
                  >
                    {selectedDevice.status === "online"
                      ? "Set Offline"
                      : "Set Online"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-1 h-4 w-4" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to remove this device?")) {
                    removeDevice(selectedDevice.id);
                  }
                }}
              >
                Remove Device
              </Button>
              <Button onClick={() => setIsDeviceDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default iPadPOS;
