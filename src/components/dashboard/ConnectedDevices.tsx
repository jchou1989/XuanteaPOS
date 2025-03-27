import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import {
  Tablet,
  Laptop,
  Smartphone,
  Printer,
  Plus,
  Trash2,
  Check,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ConnectedDevice {
  id: string;
  name: string;
  type: "ipad" | "laptop" | "mobile" | "printer" | "other";
  ipAddress: string;
  macAddress: string;
  status: "online" | "offline" | "error";
  lastConnected: string;
  location?: string;
  assignedTo?: string;
}

interface ConnectedDevicesProps {
  initialDevices?: ConnectedDevice[];
}

const ConnectedDevices = ({ initialDevices = [] }: ConnectedDevicesProps) => {
  const [devices, setDevices] = useState<ConnectedDevice[]>(
    initialDevices.length > 0
      ? initialDevices
      : [
          {
            id: "1",
            name: "Front Counter iPad",
            type: "ipad",
            ipAddress: "192.168.1.101",
            macAddress: "AA:BB:CC:DD:EE:FF",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Front Counter",
            assignedTo: "Cashier",
          },
          {
            id: "2",
            name: "Manager's iPad",
            type: "ipad",
            ipAddress: "192.168.1.102",
            macAddress: "AA:BB:CC:DD:EE:FE",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Office",
            assignedTo: "Manager",
          },
          {
            id: "3",
            name: "Kitchen Display",
            type: "laptop",
            ipAddress: "192.168.1.103",
            macAddress: "AA:BB:CC:DD:EE:FD",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Kitchen",
          },
          {
            id: "4",
            name: "Receipt Printer",
            type: "printer",
            ipAddress: "192.168.1.104",
            macAddress: "AA:BB:CC:DD:EE:FC",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Front Counter",
          },
          {
            id: "5",
            name: "Barista's iPad",
            type: "ipad",
            ipAddress: "192.168.1.105",
            macAddress: "AA:BB:CC:DD:EE:FB",
            status: "offline",
            lastConnected: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            location: "Beverage Station",
            assignedTo: "Barista",
          },
          {
            id: "6",
            name: "Outdoor Patio iPad",
            type: "ipad",
            ipAddress: "192.168.1.106",
            macAddress: "AA:BB:CC:DD:EE:FA",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Outdoor Patio",
            assignedTo: "Server",
          },
          {
            id: "7",
            name: "Bar iPad",
            type: "ipad",
            ipAddress: "192.168.1.107",
            macAddress: "AA:BB:CC:DD:EE:F9",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Bar Area",
            assignedTo: "Bartender",
          },
          {
            id: "8",
            name: "Kitchen Printer",
            type: "printer",
            ipAddress: "192.168.1.108",
            macAddress: "AA:BB:CC:DD:EE:F8",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Kitchen",
          },
          {
            id: "9",
            name: "Bar Printer",
            type: "printer",
            ipAddress: "192.168.1.109",
            macAddress: "AA:BB:CC:DD:EE:F7",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Bar Area",
          },
          {
            id: "10",
            name: "Takeout Counter iPad",
            type: "ipad",
            ipAddress: "192.168.1.110",
            macAddress: "AA:BB:CC:DD:EE:F6",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Takeout Counter",
            assignedTo: "Takeout Specialist",
          },
          {
            id: "11",
            name: "Manager's Laptop",
            type: "laptop",
            ipAddress: "192.168.1.111",
            macAddress: "AA:BB:CC:DD:EE:F5",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Office",
            assignedTo: "General Manager",
          },
          {
            id: "12",
            name: "Inventory Scanner",
            type: "other",
            ipAddress: "192.168.1.112",
            macAddress: "AA:BB:CC:DD:EE:F4",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Storage Room",
          },
          {
            id: "13",
            name: "Drive-Thru iPad",
            type: "ipad",
            ipAddress: "192.168.1.113",
            macAddress: "AA:BB:CC:DD:EE:F3",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Drive-Thru Window",
            assignedTo: "Drive-Thru Attendant",
          },
          {
            id: "14",
            name: "Beverage Station Display",
            type: "laptop",
            ipAddress: "192.168.1.114",
            macAddress: "AA:BB:CC:DD:EE:F2",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Beverage Station",
          },
          {
            id: "15",
            name: "Host Stand iPad",
            type: "ipad",
            ipAddress: "192.168.1.115",
            macAddress: "AA:BB:CC:DD:EE:F1",
            status: "online",
            lastConnected: new Date().toISOString(),
            location: "Front Entrance",
            assignedTo: "Host",
          },
        ],
  );

  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<ConnectedDevice | null>(
    null,
  );

  // Form state for new/edit device
  const [formData, setFormData] = useState<Partial<ConnectedDevice>>({
    name: "",
    type: "ipad",
    ipAddress: "",
    macAddress: "",
    status: "offline",
    location: "",
    assignedTo: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddDevice = () => {
    setEditingDevice(null);
    setFormData({
      name: "",
      type: "ipad",
      ipAddress: "",
      macAddress: "",
      status: "offline",
      location: "",
      assignedTo: "",
    });
    setIsDeviceDialogOpen(true);
  };

  const handleEditDevice = (device: ConnectedDevice) => {
    setEditingDevice(device);
    setFormData({ ...device });
    setIsDeviceDialogOpen(true);
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter((device) => device.id !== id));
  };

  const handleSaveDevice = () => {
    if (!formData.name || !formData.ipAddress) return;

    if (editingDevice) {
      // Update existing device
      setDevices(
        devices.map((device) =>
          device.id === editingDevice.id
            ? ({ ...device, ...formData } as ConnectedDevice)
            : device,
        ),
      );
    } else {
      // Add new device
      const newDevice: ConnectedDevice = {
        id: Date.now().toString(),
        name: formData.name || "",
        type: formData.type as
          | "ipad"
          | "laptop"
          | "mobile"
          | "printer"
          | "other",
        ipAddress: formData.ipAddress || "",
        macAddress: formData.macAddress || "",
        status: "offline",
        lastConnected: new Date().toISOString(),
        location: formData.location,
        assignedTo: formData.assignedTo,
      };
      setDevices([...devices, newDevice]);
    }

    setIsDeviceDialogOpen(false);
  };

  const handleRefreshStatus = (id: string) => {
    // Simulate checking device status
    setDevices(
      devices.map((device) =>
        device.id === id
          ? {
              ...device,
              status: Math.random() > 0.3 ? "online" : "offline",
              lastConnected:
                device.status === "offline"
                  ? device.lastConnected
                  : new Date().toISOString(),
            }
          : device,
      ),
    );
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case "ipad":
        return <Tablet className="h-5 w-5" />;
      case "laptop":
        return <Laptop className="h-5 w-5" />;
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "printer":
        return <Printer className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Wifi className="h-3 w-3" /> Online
          </Badge>
        );
      case "offline":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1"
          >
            <WifiOff className="h-3 w-3" /> Offline
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="h-3 w-3" /> Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Connected Devices</h2>
        <p className="text-muted-foreground">
          Manage iPads, printers, and other devices connected to your POS system
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">All Devices</h3>
        <Button onClick={handleAddDevice} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {devices.map((device) => (
          <Card key={device.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getDeviceTypeIcon(device.type)}
                  <CardTitle className="text-base">{device.name}</CardTitle>
                </div>
                {getStatusBadge(device.status)}
              </div>
              <CardDescription>
                {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>IP Address:</span>
                  <span className="font-medium">{device.ipAddress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MAC Address:</span>
                  <span className="font-medium">{device.macAddress}</span>
                </div>
                {device.location && (
                  <div className="flex justify-between text-sm">
                    <span>Location:</span>
                    <span className="font-medium">{device.location}</span>
                  </div>
                )}
                {device.assignedTo && (
                  <div className="flex justify-between text-sm">
                    <span>Assigned To:</span>
                    <span className="font-medium">{device.assignedTo}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Last Connected:</span>
                  <span className="font-medium">
                    {formatDateTime(device.lastConnected)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefreshStatus(device.id)}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditDevice(device)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDevice(device.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add/Edit Device Dialog */}
      <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? "Edit Device" : "Add New Device"}
            </DialogTitle>
            <DialogDescription>
              {editingDevice
                ? "Update the details of this device"
                : "Add a new device to your system"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter device name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Device Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ipad">iPad</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                value={formData.ipAddress || ""}
                onChange={handleInputChange}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                name="macAddress"
                value={formData.macAddress || ""}
                onChange={handleInputChange}
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </div>

            {formData.type === "ipad" && (
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={handleInputChange}
                  placeholder="Enter staff role or name"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeviceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDevice}>
              {editingDevice ? "Update Device" : "Add Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectedDevices;
