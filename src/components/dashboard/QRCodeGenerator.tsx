import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Printer, Download, Check, X } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  isOpen?: boolean;
  onClose?: () => void;
  orderDetails?: {
    id: string;
    items: Array<{
      id: string;
      name: string;
      type: "beverage" | "food";
      customizations?: {
        size?: string;
        sugar?: string;
        ice?: string;
      };
    }>;
  };
}

const QRCodeGenerator = ({
  isOpen = true,
  onClose = () => {},
  orderDetails = {
    id: "ORD-12345",
    items: [
      {
        id: "ITM-001",
        name: "Jasmine Milk Tea",
        type: "beverage",
        customizations: {
          size: "Large",
          sugar: "50%",
          ice: "Less",
        },
      },
      {
        id: "ITM-002",
        name: "Oolong Tea",
        type: "beverage",
        customizations: {
          size: "Medium",
          sugar: "25%",
          ice: "Regular",
        },
      },
    ],
  },
}: QRCodeGeneratorProps) => {
  const [selectedItem, setSelectedItem] = useState(orderDetails.items[0]);
  const [printStatus, setPrintStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  // Generate QR code data URL when selected item changes
  React.useEffect(() => {
    generateQRCodeDataUrl(selectedItem);
  }, [selectedItem]);

  // Generate a QR code data URL using the qrcode library
  const generateQRCodeDataUrl = async (item: typeof selectedItem) => {
    try {
      // Create a unique identifier based on order ID, item ID, name, and all customizations
      const customizationsStr = item.customizations
        ? Object.entries(item.customizations)
            .map(([key, value]) => `${key}:${value}`)
            .join("|")
        : "";

      const seed = `${orderDetails.id}-${item.id}-${item.name}-${customizationsStr}`;
      const qrData = JSON.stringify({
        orderId: orderDetails.id,
        itemId: item.id,
        name: item.name,
        customizations: item.customizations,
        uniqueId: seed,
      });

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000",
          light: "#fff",
        },
      });

      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
      // Fallback to API if local generation fails
      const fallbackUrl = getQRCodeApiUrl(item);
      setQrCodeDataUrl(fallbackUrl);
    }
  };

  // Fallback method using external API
  const getQRCodeApiUrl = (item: typeof selectedItem) => {
    const customizationsStr = item.customizations
      ? Object.entries(item.customizations)
          .map(([key, value]) => `${key}:${value}`)
          .join("|")
      : "";

    const seed = `${orderDetails.id}-${item.id}-${item.name}-${customizationsStr}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      JSON.stringify({
        orderId: orderDetails.id,
        itemId: item.id,
        name: item.name,
        customizations: item.customizations,
        uniqueId: seed,
      }),
    )}`;
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      setPrintStatus("idle");
      return Promise.resolve();
    },
    onPrintError: (error) => {
      console.error("Printing failed:", error);
      setPrintStatus("error");
      setTimeout(() => setPrintStatus("idle"), 2000);
    },
    onAfterPrint: () => {
      console.log("Printing completed successfully");
      setPrintStatus("success");
      setTimeout(() => setPrintStatus("idle"), 2000);
    },
    removeAfterPrint: true,
    pageStyle: `
      @media print {
        @page {
          size: 58mm 40mm; /* Standard receipt printer size */
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .print-container {
          width: 58mm;
          padding: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .print-only {
          display: block !important;
          font-size: 10pt;
          line-height: 1.2;
        }
        img {
          max-width: 50mm;
          height: auto;
        }
      }
    `,
  });

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${orderDetails.id}-${selectedItem.id}.png`;

    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Generate QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Label className="mb-2 block">Select Beverage Item</Label>
          <Tabs defaultValue={orderDetails.items[0].id} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              {orderDetails.items
                .filter((item) => item.type === "beverage")
                .map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.name}
                  </TabsTrigger>
                ))}
            </TabsList>

            {orderDetails.items
              .filter((item) => item.type === "beverage")
              .map((item) => (
                <TabsContent key={item.id} value={item.id} className="mt-0">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 w-full flex justify-center">
                          <div ref={printRef} className="print-container">
                            <img
                              src={qrCodeDataUrl || getQRCodeApiUrl(item)}
                              alt={`QR Code for ${item.name}`}
                              className="w-48 h-48"
                            />
                            <div
                              className="print-only mt-2 text-center"
                              style={{ display: "none" }}
                            >
                              <div className="font-bold">{item.name}</div>
                              {item.customizations?.size && (
                                <div>Size: {item.customizations.size}</div>
                              )}
                              {item.customizations?.sugar && (
                                <div>Sugar: {item.customizations.sugar}</div>
                              )}
                              {item.customizations?.ice && (
                                <div>Ice: {item.customizations.ice}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-full space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Item:</span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          {item.customizations?.size && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Size:</span>
                              <span className="font-medium">
                                {item.customizations.size}
                              </span>
                            </div>
                          )}
                          {item.customizations?.sugar && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Sugar Level:
                              </span>
                              <span className="font-medium">
                                {item.customizations.sugar}
                              </span>
                            </div>
                          )}
                          {item.customizations?.ice && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Ice Level:</span>
                              <span className="font-medium">
                                {item.customizations.ice}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
          </Tabs>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={handleDownload}
          >
            <Download size={16} />
            Download QR
          </Button>

          <Button
            className="w-full sm:w-auto flex items-center gap-2 relative"
            onClick={handlePrint}
            disabled={printStatus !== "idle"}
          >
            {printStatus === "idle" && (
              <>
                <Printer size={16} />
                Print Label
              </>
            )}
            {printStatus === "success" && (
              <>
                <Check size={16} />
                Printed!
              </>
            )}
            {printStatus === "error" && (
              <>
                <X size={16} />
                Print Failed
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
