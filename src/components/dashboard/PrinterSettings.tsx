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
  Printer,
  Plus,
  Trash2,
  Check,
  X,
  RefreshCw,
  FileText,
  QrCode,
  Settings,
  Edit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";

interface PrinterDevice {
  id: string;
  name: string;
  type: "receipt" | "label" | "kitchen";
  model: string;
  connection: "usb" | "network" | "bluetooth";
  address: string;
  status: "online" | "offline" | "error";
  defaultFor?: string[];
}

interface PrintTemplate {
  id: string;
  name: string;
  type: "receipt" | "label" | "kitchen";
  content: string;
}

interface PrinterSettingsProps {
  initialPrinters?: PrinterDevice[];
}

const PrinterSettings = ({ initialPrinters = [] }: PrinterSettingsProps) => {
  const [printers, setPrinters] = useState<PrinterDevice[]>(
    initialPrinters.length > 0
      ? initialPrinters
      : [
          {
            id: "1",
            name: "Main Receipt Printer",
            type: "receipt",
            model: "Epson TM-T88VI",
            connection: "network",
            address: "192.168.1.100",
            status: "online",
            defaultFor: ["receipts", "reports"],
          },
          {
            id: "2",
            name: "Kitchen Display Printer",
            type: "kitchen",
            model: "Star TSP143III",
            connection: "usb",
            address: "USB001",
            status: "online",
            defaultFor: ["kitchen_orders"],
          },
          {
            id: "3",
            name: "Label Printer",
            type: "label",
            model: "Zebra ZD410",
            connection: "usb",
            address: "USB002",
            status: "offline",
            defaultFor: ["beverage_labels"],
          },
        ],
  );

  const [templates, setTemplates] = useState<PrintTemplate[]>([
    {
      id: "1",
      name: "Receipt Template",
      type: "receipt",
      content:
        "{{header}}\n\nOrder #{{order_number}}\nDate: {{date}}\n\n{{items}}\n\nSubtotal: {{subtotal}}\nTax: {{tax}}\nTotal: {{total}}\n\n{{footer}}",
    },
    {
      id: "2",
      name: "Beverage Label",
      type: "label",
      content:
        "{{item_name}}\n{{size}} | {{sugar_level}} | {{ice_level}}\n{{qr_code}}\n{{date_time}}",
    },
    {
      id: "3",
      name: "Kitchen Order",
      type: "kitchen",
      content:
        "Order #{{order_number}}\nTime: {{time}}\nType: {{order_type}}\n\n{{items}}\n\nNotes: {{special_instructions}}",
    },
  ]);

  const [activeTab, setActiveTab] = useState("printers");
  const [isPrinterDialogOpen, setIsPrinterDialogOpen] = useState(false);
  const [isTestPrintDialogOpen, setIsTestPrintDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterDevice | null>(
    null,
  );
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(
    null,
  );
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterDevice | null>(
    null,
  );
  const [testPrintType, setTestPrintType] = useState<string>("receipt");

  // Form state for new/edit printer
  const [formData, setFormData] = useState<Partial<PrinterDevice>>({
    name: "",
    type: "receipt",
    model: "",
    connection: "network",
    address: "",
    status: "offline",
    defaultFor: [],
  });

  // Form state for template editing
  const [templateFormData, setTemplateFormData] = useState<
    Partial<PrintTemplate>
  >({
    name: "",
    type: "receipt",
    content: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTemplateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTemplateFormData({
      ...templateFormData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTemplateSelectChange = (name: string, value: string) => {
    setTemplateFormData({
      ...templateFormData,
      [name]: value,
    });
  };

  const handleAddPrinter = () => {
    setEditingPrinter(null);
    setFormData({
      name: "",
      type: "receipt",
      model: "",
      connection: "network",
      address: "",
      status: "offline",
      defaultFor: [],
    });
    setIsPrinterDialogOpen(true);
  };

  const handleEditPrinter = (printer: PrinterDevice) => {
    setEditingPrinter(printer);
    setFormData({ ...printer });
    setIsPrinterDialogOpen(true);
  };

  const handleEditTemplate = (template: PrintTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData({ ...template });
    setIsTemplateDialogOpen(true);
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters(printers.filter((printer) => printer.id !== id));
  };

  const handleTestPrint = (printer: PrinterDevice) => {
    setSelectedPrinter(printer);
    setTestPrintType(printer.type === "label" ? "label" : "receipt");
    setIsTestPrintDialogOpen(true);
  };

  const handleSavePrinter = () => {
    if (!formData.name || !formData.model) return;

    if (editingPrinter) {
      // Update existing printer
      setPrinters(
        printers.map((printer) =>
          printer.id === editingPrinter.id
            ? ({ ...printer, ...formData } as PrinterDevice)
            : printer,
        ),
      );
    } else {
      // Add new printer
      const newPrinter: PrinterDevice = {
        id: Date.now().toString(),
        name: formData.name || "",
        type: formData.type as "receipt" | "label" | "kitchen",
        model: formData.model || "",
        connection: formData.connection as "usb" | "network" | "bluetooth",
        address: formData.address || "",
        status: "offline",
        defaultFor: formData.defaultFor || [],
      };
      setPrinters([...printers, newPrinter]);
    }

    setIsPrinterDialogOpen(false);
  };

  const handleSaveTemplate = () => {
    if (!templateFormData.name || !templateFormData.content) return;

    if (editingTemplate) {
      // Update existing template
      setTemplates(
        templates.map((template) =>
          template.id === editingTemplate.id
            ? ({ ...template, ...templateFormData } as PrintTemplate)
            : template,
        ),
      );
    } else {
      // Add new template
      const newTemplate: PrintTemplate = {
        id: Date.now().toString(),
        name: templateFormData.name || "",
        type: templateFormData.type as "receipt" | "label" | "kitchen",
        content: templateFormData.content || "",
      };
      setTemplates([...templates, newTemplate]);
    }

    setIsTemplateDialogOpen(false);
  };

  const handleSendTestPrint = () => {
    // Simulate sending a test print
    setTimeout(() => {
      setIsTestPrintDialogOpen(false);
    }, 1500);
  };

  const toggleDefaultPrintType = (
    printer: PrinterDevice,
    printType: string,
  ) => {
    const updatedPrinters = printers.map((p) => {
      if (p.id === printer.id) {
        const defaultFor = [...(p.defaultFor || [])];
        const index = defaultFor.indexOf(printType);

        if (index > -1) {
          defaultFor.splice(index, 1);
        } else {
          defaultFor.push(printType);

          // Remove this print type from other printers if it's now the default
          printers.forEach((otherPrinter) => {
            if (
              otherPrinter.id !== printer.id &&
              otherPrinter.defaultFor?.includes(printType)
            ) {
              const otherDefaultFor = [...(otherPrinter.defaultFor || [])];
              const otherIndex = otherDefaultFor.indexOf(printType);
              if (otherIndex > -1) {
                otherDefaultFor.splice(otherIndex, 1);
                otherPrinter.defaultFor = otherDefaultFor;
              }
            }
          });
        }

        return { ...p, defaultFor };
      }
      return p;
    });

    setPrinters(updatedPrinters);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> Online
          </Badge>
        );
      case "offline":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Offline
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

  const getPrinterTypeIcon = (type: string) => {
    switch (type) {
      case "receipt":
        return <Printer className="h-4 w-4" />;
      case "label":
        return <QrCode className="h-4 w-4" />;
      case "kitchen":
        return <FileText className="h-4 w-4" />;
      default:
        return <Printer className="h-4 w-4" />;
    }
  };

  const getPrinterTypeName = (type: string) => {
    switch (type) {
      case "receipt":
        return "Receipt Printer";
      case "label":
        return "Label Printer";
      case "kitchen":
        return "Kitchen Printer";
      default:
        return "Printer";
    }
  };

  const getConnectionName = (connection: string) => {
    switch (connection) {
      case "usb":
        return "USB";
      case "network":
        return "Network";
      case "bluetooth":
        return "Bluetooth";
      default:
        return connection;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Printer Settings</h2>
        <p className="text-muted-foreground">
          Configure and manage printers for receipts, labels, and kitchen orders
        </p>
      </div>

      <Tabs
        defaultValue="printers"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="printers" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Printers
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Print Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Print Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="printers" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Connected Printers</h3>
            <Button
              onClick={handleAddPrinter}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Printer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printers.map((printer) => (
              <Card key={printer.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getPrinterTypeIcon(printer.type)}
                      <CardTitle className="text-base">
                        {printer.name}
                      </CardTitle>
                    </div>
                    {getStatusBadge(printer.status)}
                  </div>
                  <CardDescription>{printer.model}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span className="font-medium">
                        {getPrinterTypeName(printer.type)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Connection:</span>
                      <span className="font-medium">
                        {getConnectionName(printer.connection)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Address:</span>
                      <span className="font-medium">{printer.address}</span>
                    </div>
                    {printer.defaultFor && printer.defaultFor.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm font-medium">
                          Default for:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {printer.defaultFor.map((type) => (
                            <Badge
                              key={type}
                              variant="secondary"
                              className="text-xs"
                            >
                              {type.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestPrint(printer)}
                    disabled={printer.status !== "online"}
                  >
                    Test Print
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPrinter(printer)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePrinter(printer.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Print Templates</CardTitle>
              <CardDescription>
                Customize the layout and content of printed materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        {template.type === "receipt" &&
                          "Customize customer receipts with logo, contact info, and special offers"}
                        {template.type === "label" &&
                          "Customize beverage labels with QR codes and preparation details"}
                        {template.type === "kitchen" &&
                          "Customize kitchen order slips with preparation instructions"}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Print Settings</CardTitle>
              <CardDescription>
                Configure default printers and automatic printing options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Default Printers</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="font-medium">Receipt Printing</div>
                      <div className="col-span-2">
                        {printers.map((printer) => (
                          <div
                            key={printer.id}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Switch
                              id={`receipt-${printer.id}`}
                              checked={
                                printer.defaultFor?.includes("receipts") ||
                                false
                              }
                              onCheckedChange={() =>
                                toggleDefaultPrintType(printer, "receipts")
                              }
                              disabled={printer.status !== "online"}
                            />
                            <Label
                              htmlFor={`receipt-${printer.id}`}
                              className="flex-1"
                            >
                              {printer.name}
                            </Label>
                            {printer.status !== "online" && (
                              <Badge variant="outline" className="text-xs">
                                Offline
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="font-medium">Kitchen Orders</div>
                      <div className="col-span-2">
                        {printers.map((printer) => (
                          <div
                            key={printer.id}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Switch
                              id={`kitchen-${printer.id}`}
                              checked={
                                printer.defaultFor?.includes(
                                  "kitchen_orders",
                                ) || false
                              }
                              onCheckedChange={() =>
                                toggleDefaultPrintType(
                                  printer,
                                  "kitchen_orders",
                                )
                              }
                              disabled={printer.status !== "online"}
                            />
                            <Label
                              htmlFor={`kitchen-${printer.id}`}
                              className="flex-1"
                            >
                              {printer.name}
                            </Label>
                            {printer.status !== "online" && (
                              <Badge variant="outline" className="text-xs">
                                Offline
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="font-medium">Beverage Labels</div>
                      <div className="col-span-2">
                        {printers.map((printer) => (
                          <div
                            key={printer.id}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Switch
                              id={`label-${printer.id}`}
                              checked={
                                printer.defaultFor?.includes(
                                  "beverage_labels",
                                ) || false
                              }
                              onCheckedChange={() =>
                                toggleDefaultPrintType(
                                  printer,
                                  "beverage_labels",
                                )
                              }
                              disabled={
                                printer.status !== "online" ||
                                printer.type !== "label"
                              }
                            />
                            <Label
                              htmlFor={`label-${printer.id}`}
                              className="flex-1"
                            >
                              {printer.name}
                            </Label>
                            {printer.status !== "online" && (
                              <Badge variant="outline" className="text-xs">
                                Offline
                              </Badge>
                            )}
                            {printer.type !== "label" && (
                              <Badge variant="outline" className="text-xs">
                                Not a label printer
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="font-medium">Reports</div>
                      <div className="col-span-2">
                        {printers.map((printer) => (
                          <div
                            key={printer.id}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Switch
                              id={`reports-${printer.id}`}
                              checked={
                                printer.defaultFor?.includes("reports") || false
                              }
                              onCheckedChange={() =>
                                toggleDefaultPrintType(printer, "reports")
                              }
                              disabled={printer.status !== "online"}
                            />
                            <Label
                              htmlFor={`reports-${printer.id}`}
                              className="flex-1"
                            >
                              {printer.name}
                            </Label>
                            {printer.status !== "online" && (
                              <Badge variant="outline" className="text-xs">
                                Offline
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Automatic Printing
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-print-receipts">
                          Auto-Print Receipts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically print receipts when orders are completed
                        </p>
                      </div>
                      <Switch id="auto-print-receipts" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-print-kitchen">
                          Auto-Print Kitchen Orders
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically print kitchen orders when placed
                        </p>
                      </div>
                      <Switch id="auto-print-kitchen" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-print-labels">
                          Auto-Print Beverage Labels
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically print labels for beverage items
                        </p>
                      </div>
                      <Switch id="auto-print-labels" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-print-delivery">
                          Auto-Print Delivery Orders
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically print orders from delivery platforms
                        </p>
                      </div>
                      <Switch id="auto-print-delivery" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Printer Dialog */}
      <Dialog open={isPrinterDialogOpen} onOpenChange={setIsPrinterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? "Edit Printer" : "Add New Printer"}
            </DialogTitle>
            <DialogDescription>
              {editingPrinter
                ? "Update the details of this printer"
                : "Add a new printer to your system"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Printer Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter printer name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Printer Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receipt">Receipt Printer</SelectItem>
                    <SelectItem value="label">Label Printer</SelectItem>
                    <SelectItem value="kitchen">Kitchen Printer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="connection">Connection Type</Label>
                <Select
                  value={formData.connection}
                  onValueChange={(value) =>
                    handleSelectChange("connection", value)
                  }
                >
                  <SelectTrigger id="connection">
                    <SelectValue placeholder="Select connection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="usb">USB</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">Printer Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model || ""}
                onChange={handleInputChange}
                placeholder="Enter printer model"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">
                {formData.connection === "network"
                  ? "IP Address"
                  : formData.connection === "bluetooth"
                    ? "Bluetooth Address"
                    : "Device ID"}
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder={
                  formData.connection === "network"
                    ? "192.168.1.100"
                    : "Enter address"
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPrinterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePrinter}>
              {editingPrinter ? "Update Printer" : "Add Printer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Customize how your{" "}
              {templateFormData.type === "receipt"
                ? "receipts"
                : templateFormData.type === "label"
                  ? "beverage labels"
                  : "kitchen orders"}{" "}
              will look when printed
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                name="name"
                value={templateFormData.name || ""}
                onChange={handleTemplateInputChange}
                placeholder="Give your template a name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template-type">What is this template for?</Label>
              <Select
                value={templateFormData.type}
                onValueChange={(value) =>
                  handleTemplateSelectChange("type", value)
                }
              >
                <SelectTrigger id="template-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Customer Receipts</SelectItem>
                  <SelectItem value="label">Beverage Labels</SelectItem>
                  <SelectItem value="kitchen">Kitchen Order Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="template-content">Template Layout</Label>
                <div className="text-xs text-muted-foreground">
                  Add information fields from the list below
                </div>
              </div>
              <Textarea
                id="template-content"
                name="content"
                value={templateFormData.content || ""}
                onChange={handleTemplateInputChange}
                placeholder="Design your template layout here"
                className="font-mono text-sm h-40"
              />
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="text-sm font-medium mb-3">
                Information Fields You Can Add
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Click any field to copy it, then paste it into your template
                layout above
              </p>
              <div className="grid grid-cols-2 gap-3">
                {templateFormData.type === "receipt" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{header}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;header&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Store name & logo
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{order_number}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;order_number&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Order ID number
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{date}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;date&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Current date
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{items}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;items&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          List of ordered items
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{subtotal}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;subtotal&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Order subtotal
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{tax}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;tax&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Tax amount
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{total}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;total&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Total amount
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{footer}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;footer&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Thank you message
                        </span>
                      </div>
                    </Button>
                  </>
                )}
                {templateFormData.type === "label" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{item_name}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;item_name&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Beverage name
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{size}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;size&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Drink size
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{sugar_level}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;sugar_level&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Sugar amount
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{ice_level}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;ice_level&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Ice amount
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{qr_code}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;qr_code&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          QR code for machine
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{date_time}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;date_time&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Date and time
                        </span>
                      </div>
                    </Button>
                  </>
                )}
                {templateFormData.type === "kitchen" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{order_number}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;order_number&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Order ID number
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{time}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;time&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Order time
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText("{{order_type}}")
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;order_type&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Dine-in/Takeout/Delivery
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => navigator.clipboard.writeText("{{items}}")}
                    >
                      <div className="flex flex-col items-start">
                        <span>&#123;&#123;items&#125;&#125;</span>
                        <span className="text-[10px] text-muted-foreground">
                          Food items to prepare
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          "{{special_instructions}}",
                        )
                      }
                    >
                      <div className="flex flex-col items-start">
                        <span>
                          &#123;&#123;special_instructions&#125;&#125;
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Customer requests
                        </span>
                      </div>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Print Dialog */}
      <Dialog
        open={isTestPrintDialogOpen}
        onOpenChange={setIsTestPrintDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Test Print</DialogTitle>
            <DialogDescription>
              Send a test print to {selectedPrinter?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="printType">Print Type</Label>
              <Select value={testPrintType} onValueChange={setTestPrintType}>
                <SelectTrigger id="printType">
                  <SelectValue placeholder="Select print type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPrinter?.type === "label" ? (
                    <SelectItem value="label">Label</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="test_page">Test Page</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTestPrintDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTestPrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Send Test Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrinterSettings;
