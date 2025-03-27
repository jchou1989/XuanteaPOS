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
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DeliveryIntegrationsProps {
  onSave?: (platform: string, config: DeliveryPlatformConfig) => void;
}

interface DeliveryPlatformConfig {
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  storeId: string;
  autoAcceptOrders: boolean;
  printAutomatically: boolean;
}

const DeliveryIntegrations = ({
  onSave = () => {},
}: DeliveryIntegrationsProps) => {
  const [talabatConfig, setTalabatConfig] = useState<DeliveryPlatformConfig>({
    enabled: false,
    apiKey: "",
    secretKey: "",
    storeId: "",
    autoAcceptOrders: true,
    printAutomatically: true,
  });

  const [deliverooConfig, setDeliverooConfig] =
    useState<DeliveryPlatformConfig>({
      enabled: false,
      apiKey: "",
      secretKey: "",
      storeId: "",
      autoAcceptOrders: true,
      printAutomatically: true,
    });

  const [snoonuConfig, setSnoonuConfig] = useState<DeliveryPlatformConfig>({
    enabled: false,
    apiKey: "",
    secretKey: "",
    storeId: "",
    autoAcceptOrders: true,
    printAutomatically: true,
  });

  const [activeTab, setActiveTab] = useState("talabat");
  const [testStatus, setTestStatus] = useState<{
    platform: string;
    status: "idle" | "testing" | "success" | "error";
    message?: string;
  }>({
    platform: "",
    status: "idle",
  });

  const handleSave = (platform: string) => {
    let config;
    switch (platform) {
      case "talabat":
        config = talabatConfig;
        break;
      case "deliveroo":
        config = deliverooConfig;
        break;
      case "snoonu":
        config = snoonuConfig;
        break;
      default:
        return;
    }
    onSave(platform, config);
  };

  const handleTestConnection = (platform: string) => {
    setTestStatus({
      platform,
      status: "testing",
    });

    // Simulate API test
    setTimeout(() => {
      if (platform === "talabat" && !talabatConfig.apiKey) {
        setTestStatus({
          platform,
          status: "error",
          message: "API Key is required",
        });
        return;
      }

      if (platform === "deliveroo" && !deliverooConfig.apiKey) {
        setTestStatus({
          platform,
          status: "error",
          message: "API Key is required",
        });
        return;
      }

      if (platform === "snoonu" && !snoonuConfig.apiKey) {
        setTestStatus({
          platform,
          status: "error",
          message: "API Key is required",
        });
        return;
      }

      setTestStatus({
        platform,
        status: "success",
        message: "Connection successful",
      });
    }, 1500);
  };

  const updateConfig = (
    platform: string,
    field: keyof DeliveryPlatformConfig,
    value: string | boolean,
  ) => {
    switch (platform) {
      case "talabat":
        setTalabatConfig({ ...talabatConfig, [field]: value });
        break;
      case "deliveroo":
        setDeliverooConfig({ ...deliverooConfig, [field]: value });
        break;
      case "snoonu":
        setSnoonuConfig({ ...snoonuConfig, [field]: value });
        break;
    }
  };

  const renderPlatformConfig = (
    platform: string,
    config: DeliveryPlatformConfig,
  ) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={`${platform}-enabled`}>Enable Integration</Label>
            <p className="text-sm text-muted-foreground">
              Turn on to receive orders from this platform
            </p>
          </div>
          <Switch
            id={`${platform}-enabled`}
            checked={config.enabled}
            onCheckedChange={(checked) =>
              updateConfig(platform, "enabled", checked)
            }
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`${platform}-api-key`}>API Key</Label>
            <Input
              id={`${platform}-api-key`}
              placeholder="Enter API key"
              value={config.apiKey}
              onChange={(e) => updateConfig(platform, "apiKey", e.target.value)}
              disabled={!config.enabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${platform}-secret-key`}>Secret Key</Label>
            <Input
              id={`${platform}-secret-key`}
              type="password"
              placeholder="Enter secret key"
              value={config.secretKey}
              onChange={(e) =>
                updateConfig(platform, "secretKey", e.target.value)
              }
              disabled={!config.enabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${platform}-store-id`}>Store ID</Label>
            <Input
              id={`${platform}-store-id`}
              placeholder="Enter store ID"
              value={config.storeId}
              onChange={(e) =>
                updateConfig(platform, "storeId", e.target.value)
              }
              disabled={!config.enabled}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`${platform}-auto-accept`}>
                Auto-Accept Orders
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept incoming orders
              </p>
            </div>
            <Switch
              id={`${platform}-auto-accept`}
              checked={config.autoAcceptOrders}
              onCheckedChange={(checked) =>
                updateConfig(platform, "autoAcceptOrders", checked)
              }
              disabled={!config.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`${platform}-auto-print`}>
                Auto-Print Orders
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically print new orders
              </p>
            </div>
            <Switch
              id={`${platform}-auto-print`}
              checked={config.printAutomatically}
              onCheckedChange={(checked) =>
                updateConfig(platform, "printAutomatically", checked)
              }
              disabled={!config.enabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => handleTestConnection(platform)}
            disabled={!config.enabled || !config.apiKey}
          >
            Test Connection
          </Button>

          {testStatus.platform === platform && testStatus.status !== "idle" && (
            <div className="flex items-center">
              {testStatus.status === "testing" && (
                <p className="text-sm">Testing connection...</p>
              )}
              {testStatus.status === "success" && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <p className="text-sm">{testStatus.message}</p>
                </div>
              )}
              {testStatus.status === "error" && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <p className="text-sm">{testStatus.message}</p>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => handleSave(platform)}
            disabled={!config.enabled}
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Delivery Platform Integrations</h2>
        <p className="text-muted-foreground">
          Configure integration settings for third-party delivery platforms
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>
            Set up API credentials and preferences for each delivery platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="talabat"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="talabat">Talabat</TabsTrigger>
              <TabsTrigger value="deliveroo">Deliveroo</TabsTrigger>
              <TabsTrigger value="snoonu">Snoonu</TabsTrigger>
            </TabsList>
            <TabsContent value="talabat" className="pt-4">
              {renderPlatformConfig("talabat", talabatConfig)}
            </TabsContent>
            <TabsContent value="deliveroo" className="pt-4">
              {renderPlatformConfig("deliveroo", deliverooConfig)}
            </TabsContent>
            <TabsContent value="snoonu" className="pt-4">
              {renderPlatformConfig("snoonu", snoonuConfig)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryIntegrations;
