import React, { useState } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Wifi, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WiFiNetwork {
  id: string;
  name: string;
  connected: boolean;
  security: "secure" | "open";
  signalStrength: "strong" | "medium" | "weak";
}

const WiFiSettings = () => {
  const [autoConnect, setAutoConnect] = useState(true);
  const [notifyNewNetworks, setNotifyNewNetworks] = useState(true);
  const [dataSavingMode, setDataSavingMode] = useState(false);
  const [networks, setNetworks] = useState<WiFiNetwork[]>([
    {
      id: "1",
      name: "Xuan Tea Main",
      connected: true,
      security: "secure",
      signalStrength: "strong",
    },
    {
      id: "2",
      name: "Xuan Tea Staff",
      connected: false,
      security: "secure",
      signalStrength: "strong",
    },
    {
      id: "3",
      name: "Xuan Tea Guest",
      connected: false,
      security: "open",
      signalStrength: "medium",
    },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  const handleConnect = (networkId: string) => {
    setNetworks((prev) => {
      const updatedNetworks = prev.map((network) => ({
        ...network,
        connected: network.id === networkId,
      }));

      const network = updatedNetworks.find((n) => n.id === networkId);
      if (network) {
        alert(`Connected to ${network.name}`);
      }

      return updatedNetworks;
    });
  };

  const scanForNetworks = () => {
    setIsScanning(true);

    // Simulate finding new networks
    setTimeout(() => {
      const newNetworks: WiFiNetwork[] = [
        {
          id: "4",
          name: "Cafe Next Door",
          connected: false,
          security: "secure",
          signalStrength: "medium",
        },
        {
          id: "5",
          name: "Public WiFi",
          connected: false,
          security: "open",
          signalStrength: "weak",
        },
      ];

      setNetworks((prev) => {
        // Filter out networks that already exist
        const filteredNewNetworks = newNetworks.filter(
          (newNetwork) =>
            !prev.some(
              (existingNetwork) => existingNetwork.id === newNetwork.id,
            ),
        );

        const updatedNetworks = [...prev, ...filteredNewNetworks];
        alert(
          `Scan complete. Found ${filteredNewNetworks.length} new networks.`,
        );
        return updatedNetworks;
      });

      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">WiFi Settings</h1>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Available Networks</h2>
          <Button
            onClick={() => scanForNetworks()}
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? "Scanning..." : "Scan"}
          </Button>
        </div>
        <div className="space-y-4">
          {networks.map((network) => (
            <div
              key={network.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center">
                <Wifi
                  className={`mr-2 h-5 w-5 ${network.connected ? "text-primary" : "text-muted-foreground"}`}
                />
                <div>
                  <span className="font-medium">{network.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {network.security === "secure" ? "Secure" : "Open"} •
                    {network.signalStrength === "strong"
                      ? "Strong signal"
                      : network.signalStrength === "medium"
                        ? "Medium signal"
                        : "Weak signal"}
                  </p>
                </div>
              </div>
              {network.connected ? (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Connected
                </span>
              ) : (
                <Button
                  onClick={() => handleConnect(network.id)}
                  variant="default"
                  size="sm"
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold">Network Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-connect-toggle">
              Auto-connect to known networks
            </Label>
            <Switch
              id="auto-connect-toggle"
              checked={autoConnect}
              onCheckedChange={(checked) => {
                setAutoConnect(checked);
                alert(
                  `Auto-connect to known networks ${checked ? "enabled" : "disabled"}`,
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-toggle">
              Notify when new networks are available
            </Label>
            <Switch
              id="notify-toggle"
              checked={notifyNewNetworks}
              onCheckedChange={(checked) => {
                setNotifyNewNetworks(checked);
                alert(
                  `Network notifications ${checked ? "enabled" : "disabled"}`,
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="data-saving-toggle">Use data saving mode</Label>
            <Switch
              id="data-saving-toggle"
              checked={dataSavingMode}
              onCheckedChange={(checked) => {
                setDataSavingMode(checked);
                alert(`Data saving mode ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WiFiSettings;
