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
import { Coffee, Tablet, Settings, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import CDSLogin from "./CDSLogin";

const LandingPage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowLogin(true);

    if (option === "cds") {
      navigate("/cds-login");
    }
  };

  const handleLogin = () => {
    if (selectedOption === "main") {
      navigate("/");
    } else if (selectedOption === "terminal") {
      navigate("/pos-terminal");
    } else if (selectedOption === "kitchen") {
      navigate("/kitchen-display");
    } else if (selectedOption === "cds") {
      navigate("/cds-interface");
    }
  };

  if (showLogin) {
    if (selectedOption === "cds") {
      return (
        <CDSLogin
          onLogin={(deviceId, deviceName) => navigate("/cds-interface")}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        systemName={
          selectedOption === "main"
            ? "Xuan Tea POS"
            : selectedOption === "kitchen"
              ? "Kitchen Display"
              : "POS Terminal"
        }
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-5xl px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Coffee className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Xuan Tea POS System</h1>
          <p className="text-xl text-muted-foreground">
            Select your login destination
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => handleOptionSelect("main")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Coffee className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Xuan Tea POS</CardTitle>
              </div>
              <CardDescription>
                Main management system for store operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Restaurant interior"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Access order management, menu settings, reports, table
                management, and all system configurations.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Login to Management System</Button>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => handleOptionSelect("terminal")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Tablet className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">POS Terminal</CardTitle>
              </div>
              <CardDescription>
                Point of sale interface for taking orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800&q=80"
                  alt="POS terminal"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Streamlined interface for cashiers and baristas to quickly take
                and process customer orders.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Login to POS Terminal</Button>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => handleOptionSelect("kitchen")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Kitchen Display</CardTitle>
              </div>
              <CardDescription>
                View and manage orders in the kitchen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80"
                  alt="Kitchen display"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Kitchen-focused interface for tracking and managing food
                preparation and order fulfillment.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Login to Kitchen Display</Button>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => handleOptionSelect("cds")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Customer Display</CardTitle>
              </div>
              <CardDescription>Customer-facing display system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1611323593358-06b910470ec9?w=800&q=80"
                  alt="Customer display"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Interactive display for customers to view their orders,
                customize items, and place orders directly.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Login to Customer Display</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
