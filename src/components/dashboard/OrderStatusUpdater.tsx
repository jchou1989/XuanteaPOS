import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Coffee,
  MessageSquare,
  Send,
} from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

type OrderStatus = "pending" | "preparing" | "ready" | "completed";

interface Message {
  id: string;
  sender: "kitchen" | "front-desk";
  content: string;
  timestamp: Date;
}

interface OrderStatusUpdaterProps {
  orderId?: string;
  initialStatus?: OrderStatus;
  onStatusChange?: (status: OrderStatus) => void;
}

const OrderStatusUpdater = ({
  orderId = "ORD-12345",
  initialStatus = "pending",
  onStatusChange = () => {},
}: OrderStatusUpdaterProps) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "front-desk",
      content: "Order received. Customer requested extra napkins.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      sender: "kitchen",
      content: "Starting preparation. ETA 10 minutes.",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    onStatusChange(newStatus);

    // Add automatic status update message
    const statusMessages = {
      pending: "Order marked as pending.",
      preparing: "Order is now being prepared.",
      ready: "Order is ready for pickup/delivery.",
      completed: "Order has been completed.",
    };

    addMessage("front-desk", statusMessages[newStatus]);
  };

  const addMessage = (sender: "kitchen" | "front-desk", content: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addMessage("front-desk", newMessage.trim());
      setNewMessage("");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      preparing: <Coffee className="h-4 w-4" />,
      ready: <CheckCircle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
    };
    return icons[status];
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Order Status: {orderId}
          </CardTitle>
          <Badge
            className={`${getStatusColor(status)} flex items-center gap-1`}
          >
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Update Status</div>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("pending")}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    Pending
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark order as pending</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={status === "preparing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("preparing")}
                    className="flex items-center gap-1"
                  >
                    <Coffee className="h-4 w-4" />
                    Preparing
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark order as in preparation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={status === "ready" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("ready")}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Ready
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark order as ready for pickup/delivery</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("completed")}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark order as completed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4" />
            <div className="text-sm font-medium">Kitchen Communication</div>
          </div>

          <ScrollArea className="h-[180px] rounded border p-2 mb-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col p-2 rounded-lg text-sm ${message.sender === "kitchen" ? "bg-blue-50 ml-6" : "bg-gray-50 mr-6"}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      {message.sender === "kitchen"
                        ? "Kitchen Staff"
                        : "Front Desk"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              placeholder="Type a message to kitchen staff..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            <span>Messages are visible to all staff members</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusUpdater;
