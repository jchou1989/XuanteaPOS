import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  QrCode,
  Check,
  Clock,
  AlertCircle,
  LayoutGrid,
  Truck,
  User,
} from "lucide-react";

type OrderSource = "iPad" | "Talabat" | "Snoonu" | "Deliveroo";
type OrderStatus = "new" | "processing" | "ready" | "completed";
type ItemType = "food" | "beverage" | "mixed";
type OrderType = "dine-in" | "delivery" | "walk-in";

interface OrderItem {
  id: string;
  name: string;
  type: "food" | "beverage";
  quantity: number;
  customizations?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    notes?: string;
  };
}

interface OrderCardProps {
  id: string;
  orderNumber: string;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  timestamp: string;
  tableNumber?: string; // Added table number for dine-in orders
  orderType?: OrderType; // Added order type field
  customerName?: string; // For delivery orders
  customerPhone?: string; // For delivery orders
  deliveryAddress?: string; // For delivery orders
  onProcess?: () => void;
  onGenerateQR?: () => void;
  onPrintLabel?: () => void;
  onUpdateStatus?: (status: OrderStatus) => void;
}

const getOrderTypeFromItems = (items: OrderItem[]): ItemType => {
  const hasFood = items.some((item) => item.type === "food");
  const hasBeverage = items.some((item) => item.type === "beverage");

  if (hasFood && hasBeverage) return "mixed";
  if (hasFood) return "food";
  return "beverage";
};

const getSourceColor = (source: OrderSource): string => {
  const colors = {
    iPad: "bg-blue-100 text-blue-800",
    Talabat: "bg-orange-100 text-orange-800",
    Snoonu: "bg-purple-100 text-purple-800",
    Deliveroo: "bg-green-100 text-green-800",
  };
  return colors[source];
};

const getStatusColor = (status: OrderStatus): string => {
  const colors = {
    new: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  };
  return colors[status];
};

const getStatusIcon = (status: OrderStatus) => {
  const icons = {
    new: <AlertCircle className="h-4 w-4" />,
    processing: <Clock className="h-4 w-4" />,
    ready: <Check className="h-4 w-4" />,
    completed: <Check className="h-4 w-4" />,
  };
  return icons[status];
};

const OrderCard = ({
  id = "order-123",
  orderNumber = "#1234",
  source = "iPad",
  status = "new",
  items = [
    {
      id: "1",
      name: "Jasmine Tea",
      type: "beverage",
      quantity: 1,
      customizations: { size: "Large", sugarLevel: "50%", iceLevel: "Less" },
    },
    { id: "2", name: "Green Tea Cake", type: "food", quantity: 2 },
  ],
  timestamp = new Date().toLocaleTimeString(),
  tableNumber,
  orderType = "dine-in",
  customerName,
  customerPhone,
  deliveryAddress,
  onProcess = () => console.log("Processing order"),
  onGenerateQR = () => console.log("Generating QR code"),
  onPrintLabel = () => console.log("Printing label"),
  onUpdateStatus = (status) => console.log(`Updating status to ${status}`),
}: OrderCardProps) => {
  const orderTypeFromItems = getOrderTypeFromItems(items);

  return (
    <Card className="w-[380px] h-[220px] bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-lg">{orderNumber}</h3>
          <Badge className={`${getSourceColor(source)}`}>{source}</Badge>
        </div>
        <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-2 pb-2 max-h-[100px] overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-gray-500">{timestamp}</p>
          {orderType === "dine-in" && tableNumber && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <LayoutGrid className="h-3 w-3" />
              {tableNumber}
            </Badge>
          )}
          {orderType === "walk-in" && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <User className="h-3 w-3" />
              Walk-in
            </Badge>
          )}
          {orderType === "delivery" && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <Truck className="h-3 w-3" />
              Delivery
            </Badge>
          )}
        </div>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <span className="font-medium">{item.quantity}x</span> {item.name}
              {item.customizations && (
                <span className="text-xs text-gray-500 block ml-4">
                  {item.customizations.size &&
                    `Size: ${item.customizations.size}`}{" "}
                  {item.customizations.sugarLevel &&
                    `Sugar: ${item.customizations.sugarLevel}`}{" "}
                  {item.customizations.iceLevel &&
                    `Ice: ${item.customizations.iceLevel}`}
                  {item.customizations.notes &&
                    `Notes: ${item.customizations.notes}`}
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-4 pt-2 flex justify-between bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onProcess}
          className="text-xs"
        >
          Process
        </Button>

        {(orderTypeFromItems === "beverage" ||
          orderTypeFromItems === "mixed") && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateQR}
            className="text-xs flex items-center gap-1"
          >
            <QrCode className="h-3 w-3" />
            QR Code
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onPrintLabel}
          className="text-xs flex items-center gap-1"
        >
          <Printer className="h-3 w-3" />
          Print Label
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
