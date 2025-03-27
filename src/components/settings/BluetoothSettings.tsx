import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Bluetooth, Check } from "lucide-react";

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  type: "printer" | "display" | "reader" | "terminal" | "other";
}

const BluetoothSettings = () => {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [deviceVisibility, setDeviceVisibility] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([
    { id: "1", name: "Receipt Printer", connected: true, type: "printer" },
    { id: "2", name: "Kitchen Display", connected: true, type: "display" },
    { id: "3", name: "Card Reader", connected: false, type: "reader" },
  ]);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([
    { id: "4", name: "BT-POS-Terminal", connected: false, type: "terminal" },
    { id: "5", name: "Label Printer", connected: false, type: "printer" },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  // Simulate scanning for devices
  useEffect(() => {
    if (isScanning) {
      const scanTimer = setTimeout(() => {
        setIsScanning(false);
      }, 5000);
      return () => clearTimeout(scanTimer);
    }
  }, [isScanning]);

  const handlePair = (device: BluetoothDevice) => {
    // Remove from available devices
    setAvailableDevices((prev) => prev.filter((d) => d.id !== device.id));

    // Add to paired devices
    setPairedDevices((prev) => [...prev, { ...device, connected: true }]);

    // Show feedback
    alert(`Successfully paired with ${device.name}`);
  };

  const handleUnpair = (device: BluetoothDevice) => {
    // Remove from paired devices
    setPairedDevices((prev) => prev.filter((d) => d.id !== device.id));

    // Add to available devices
    setAvailableDevices((prev) => [...prev, { ...device, connected: false }]);

    // Show feedback
    alert(`Device ${device.name} has been unpaired`);
  };

  const handleToggleConnection = (deviceId: string) => {
    setPairedDevices((prev) => {
      const updatedDevices = prev.map((device) =>
        device.id === deviceId
          ? { ...device, connected: !device.connected }
          : device,
      );

      // Show feedback
      const device = updatedDevices.find((d) => d.id === deviceId);
      if (device) {
        alert(
          `${device.name} is now ${device.connected ? "connected" : "disconnected"}`,
        );
      }

      return updatedDevices;
    });
  };

  const scanForDevices = () => {
    setIsScanning(true);
    // In a real app, this would trigger Bluetooth scanning

    // Simulate finding new devices after scanning
    setTimeout(() => {
      const newDevices: BluetoothDevice[] = [
        { id: "6", name: "Smart Speaker", connected: false, type: "other" },
        { id: "7", name: "Mobile POS", connected: false, type: "terminal" },
      ];

      setAvailableDevices((prev) => {
        // Filter out any devices that are already in the list
        const filteredNewDevices = newDevices.filter(
          (newDevice) =>
            !prev.some((existingDevice) => existingDevice.id === newDevice.id),
        );

        const updatedDevices = [...prev, ...filteredNewDevices];
        alert(`Scan complete. Found ${filteredNewDevices.length} new devices.`);
        return updatedDevices;
      });

      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Bluetooth Settings</h1>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold">Paired Devices</h2>
        <div className="space-y-4">
          {pairedDevices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center">
                <Bluetooth className="mr-2 h-5 w-5 text-blue-500" />
                <span>{device.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${device.connected ? "text-green-600" : "text-red-600"}`}
                >
                  {device.connected ? "Connected" : "Not Connected"}
                </span>
                <Button
                  variant={device.connected ? "outline" : "default"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleConnection(device.id);
                  }}
                >
                  {device.connected ? "Disconnect" : "Connect"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUnpair(device);
                  }}
                >
                  Unpair
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Available Devices</h2>
          <Button
            onClick={(e) => {
              e.preventDefault();
              scanForDevices();
            }}
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? "Scanning..." : "Scan"}
          </Button>
        </div>
        <div className="space-y-4">
          {availableDevices.length > 0 ? (
            availableDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center">
                  <Bluetooth className="mr-2 h-5 w-5 text-blue-500" />
                  <span>{device.name}</span>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePair(device);
                  }}
                  variant="default"
                  size="sm"
                >
                  Pair
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No devices found. Click Scan to search for available devices.
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold">Bluetooth Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bluetooth-toggle">Bluetooth</Label>
            <Switch
              id="bluetooth-toggle"
              checked={bluetoothEnabled}
              onCheckedChange={setBluetoothEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="visibility-toggle">Device visibility</Label>
            <Switch
              id="visibility-toggle"
              checked={deviceVisibility}
              onCheckedChange={setDeviceVisibility}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-connect-toggle">
              Auto-connect to paired devices
            </Label>
            <Switch
              id="auto-connect-toggle"
              checked={autoConnect}
              onCheckedChange={setAutoConnect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BluetoothSettings;
