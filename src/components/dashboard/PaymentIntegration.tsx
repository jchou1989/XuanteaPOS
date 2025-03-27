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
import { AlertCircle, CheckCircle2, CreditCard, Wallet } from "lucide-react";

interface PaymentIntegrationProps {
  onSave?: (provider: string, config: PaymentProviderConfig) => void;
}

interface PaymentProviderConfig {
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  merchantId: string;
  testMode: boolean;
  supportedMethods: string[];
}

const PaymentIntegration = ({ onSave = () => {} }: PaymentIntegrationProps) => {
  const [qlubConfig, setQlubConfig] = useState<PaymentProviderConfig>({
    enabled: false,
    apiKey: "",
    secretKey: "",
    merchantId: "",
    testMode: true,
    supportedMethods: [
      "visa",
      "mastercard",
      "amex",
      "apple_pay",
      "google_pay",
      "qlub",
    ],
  });

  const [activeTab, setActiveTab] = useState("qlub");
  const [testStatus, setTestStatus] = useState<{
    provider: string;
    status: "idle" | "testing" | "success" | "error";
    message?: string;
  }>({
    provider: "",
    status: "idle",
  });

  const handleSave = (provider: string) => {
    let config;
    switch (provider) {
      case "qlub":
        config = qlubConfig;
        break;
      default:
        return;
    }
    onSave(provider, config);
  };

  const handleTestConnection = (provider: string) => {
    setTestStatus({
      provider,
      status: "testing",
    });

    // Simulate API test
    setTimeout(() => {
      if (provider === "qlub" && !qlubConfig.apiKey) {
        setTestStatus({
          provider,
          status: "error",
          message: "API Key is required",
        });
        return;
      }

      setTestStatus({
        provider,
        status: "success",
        message: "Connection successful",
      });
    }, 1500);
  };

  const updateConfig = (
    provider: string,
    field: keyof PaymentProviderConfig,
    value: string | boolean | string[],
  ) => {
    switch (provider) {
      case "qlub":
        setQlubConfig({ ...qlubConfig, [field]: value });
        break;
    }
  };

  const togglePaymentMethod = (provider: string, method: string) => {
    let config;
    switch (provider) {
      case "qlub":
        config = qlubConfig;
        break;
      default:
        return;
    }

    const methods = [...config.supportedMethods];
    const index = methods.indexOf(method);

    if (index > -1) {
      methods.splice(index, 1);
    } else {
      methods.push(method);
    }

    updateConfig(provider, "supportedMethods", methods);
  };

  const renderProviderConfig = (
    provider: string,
    config: PaymentProviderConfig,
  ) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={`${provider}-enabled`}>Enable Integration</Label>
            <p className="text-sm text-muted-foreground">
              Turn on to accept payments through this provider
            </p>
          </div>
          <Switch
            id={`${provider}-enabled`}
            checked={config.enabled}
            onCheckedChange={(checked) =>
              updateConfig(provider, "enabled", checked)
            }
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`${provider}-api-key`}>API Key</Label>
            <Input
              id={`${provider}-api-key`}
              placeholder="Enter API key"
              value={config.apiKey}
              onChange={(e) => updateConfig(provider, "apiKey", e.target.value)}
              disabled={!config.enabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${provider}-secret-key`}>Secret Key</Label>
            <Input
              id={`${provider}-secret-key`}
              type="password"
              placeholder="Enter secret key"
              value={config.secretKey}
              onChange={(e) =>
                updateConfig(provider, "secretKey", e.target.value)
              }
              disabled={!config.enabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${provider}-merchant-id`}>Merchant ID</Label>
            <Input
              id={`${provider}-merchant-id`}
              placeholder="Enter merchant ID"
              value={config.merchantId}
              onChange={(e) =>
                updateConfig(provider, "merchantId", e.target.value)
              }
              disabled={!config.enabled}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`${provider}-test-mode`}>Test Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use test credentials instead of production
              </p>
            </div>
            <Switch
              id={`${provider}-test-mode`}
              checked={config.testMode}
              onCheckedChange={(checked) =>
                updateConfig(provider, "testMode", checked)
              }
              disabled={!config.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Gateways</Label>
            <div className="flex flex-wrap gap-2">
              {provider !== "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("visa")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "visa")}
                  disabled={!config.enabled}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Visa
                </Button>
              )}

              {provider !== "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("mastercard")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "mastercard")}
                  disabled={!config.enabled}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Mastercard
                </Button>
              )}

              {provider !== "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("amex")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "amex")}
                  disabled={!config.enabled}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Amex
                </Button>
              )}

              {provider !== "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("apple_pay")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "apple_pay")}
                  disabled={!config.enabled}
                >
                  Apple Pay
                </Button>
              )}

              {provider !== "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("google_pay")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "google_pay")}
                  disabled={!config.enabled}
                >
                  Google Pay
                </Button>
              )}

              {provider !== "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("qlub")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "qlub")}
                  disabled={!config.enabled}
                >
                  QLUB
                </Button>
              )}

              {provider === "paypal" && (
                <Button
                  variant={
                    config.supportedMethods.includes("paypal")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePaymentMethod(provider, "paypal")}
                  disabled={!config.enabled}
                  className="flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  PayPal
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => handleTestConnection(provider)}
            disabled={!config.enabled || !config.apiKey}
          >
            Test Connection
          </Button>

          {testStatus.provider === provider && testStatus.status !== "idle" && (
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
            onClick={() => handleSave(provider)}
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
        <h2 className="text-2xl font-bold">Payment Processing Integration</h2>
        <p className="text-muted-foreground">
          Configure payment gateways and processing options
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Provider Configuration</CardTitle>
          <CardDescription>
            Set up API credentials and preferences for each payment provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="qlub"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="qlub">QLUB</TabsTrigger>
            </TabsList>
            <TabsContent value="qlub" className="pt-4">
              {renderProviderConfig("qlub", qlubConfig)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentIntegration;
