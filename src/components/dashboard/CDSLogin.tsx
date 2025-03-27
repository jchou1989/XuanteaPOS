import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Coffee, Lock, Mail, Tablet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMenuData } from "./MenuDataContext";

interface CDSLoginProps {
  onLogin?: (deviceId: string, deviceName: string) => void;
  systemName?: string;
}

const CDSLogin = ({
  onLogin = () => {},
  systemName = "Xuan Tea CDS",
}: CDSLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isNewDevice, setIsNewDevice] = useState(false);
  const navigate = useNavigate();
  const menuContext = useMenuData();

  // Fetch available devices or use sample devices if fetch fails
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data, error } = await supabase
          .from("devices")
          .select("id, name")
          .eq("device_type", "iPad");

        if (error) throw error;
        if (data && data.length > 0) {
          setDevices(data);
        } else {
          // Use sample devices if no devices found
          setDevices([
            { id: "ipad-1", name: "iPad 1" },
            { id: "ipad-2", name: "iPad 2" },
            { id: "ipad-3", name: "iPad 3" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching devices:", err);
        // Use sample devices if fetch fails
        setDevices([
          { id: "ipad-1", name: "iPad 1" },
          { id: "ipad-2", name: "iPad 2" },
          { id: "ipad-3", name: "iPad 3" },
        ]);
      }
    };

    fetchDevices();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, we'll accept any credentials
      // In a real app, you would authenticate with Supabase
      let deviceId = selectedDevice;
      let finalDeviceName = deviceName;

      if (isNewDevice && deviceName) {
        // Create a new device (simulated for demo)
        deviceId = `device-${Date.now()}`;
        finalDeviceName = deviceName;
      } else if (!selectedDevice) {
        throw new Error("Please select a device or create a new one");
      } else {
        // Get the name of the selected device
        const selectedDeviceData = devices.find((d) => d.id === selectedDevice);
        if (selectedDeviceData) {
          finalDeviceName = selectedDeviceData.name;
        }
      }

      // Store device info in localStorage
      localStorage.setItem("cdsDeviceId", deviceId);
      localStorage.setItem("cdsDeviceName", finalDeviceName);

      // Successfully logged in
      console.log("Logged in to CDS with device:", finalDeviceName);

      // Ensure menu data is loaded before navigating
      if (menuContext && !menuContext.menuItems?.length) {
        await menuContext.loadMenuItems();
      }

      // Navigate to CDS interface
      if (typeof onLogin === "function") {
        onLogin(deviceId, finalDeviceName);
      }

      // Use a timeout to ensure state updates before navigation
      setTimeout(() => {
        navigate("/cds-interface");
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      console.error("CDS Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-2">
              <Tablet className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{systemName}</CardTitle>
          <CardDescription>
            Sign in to access the Customer Display System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="device">Select Device</Label>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsNewDevice(!isNewDevice)}
                >
                  {isNewDevice
                    ? "Select existing device"
                    : "Register new device"}
                </Button>
              </div>

              {isNewDevice ? (
                <div className="relative">
                  <Tablet className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="deviceName"
                    placeholder="Enter device name (e.g. iPad 1)"
                    className="pl-10"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <Select
                  value={selectedDevice}
                  onValueChange={setSelectedDevice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.length > 0 ? (
                      devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-devices" disabled>
                        No devices available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in to CDS"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center">
            <p>Default credentials for demo:</p>
            <p>Email: admin@example.com | Password: password</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CDSLogin;
