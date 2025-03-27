import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked?: string;
}

interface InventoryManagementProps {
  initialItems?: InventoryItem[];
}

const InventoryManagement = ({
  initialItems = [],
}: InventoryManagementProps) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
    initialItems.length > 0
      ? initialItems
      : [
          {
            id: "1",
            name: "Jasmine Tea Leaves",
            category: "Tea",
            sku: "TEA-JAS-001",
            currentStock: 25,
            minStock: 10,
            unit: "kg",
            costPerUnit: 45.0,
            supplier: "Premium Tea Suppliers",
            lastRestocked: "2023-06-15",
          },
          {
            id: "2",
            name: "Oolong Tea Leaves",
            category: "Tea",
            sku: "TEA-OOL-002",
            currentStock: 8,
            minStock: 10,
            unit: "kg",
            costPerUnit: 60.0,
            supplier: "Premium Tea Suppliers",
            lastRestocked: "2023-06-10",
          },
          {
            id: "3",
            name: "Milk",
            category: "Dairy",
            sku: "DAI-MLK-001",
            currentStock: 50,
            minStock: 20,
            unit: "liter",
            costPerUnit: 3.5,
            supplier: "Local Dairy Farm",
            lastRestocked: "2023-06-18",
          },
          {
            id: "4",
            name: "Sugar",
            category: "Sweeteners",
            sku: "SWT-SGR-001",
            currentStock: 40,
            minStock: 15,
            unit: "kg",
            costPerUnit: 2.0,
            supplier: "Global Ingredients Co.",
            lastRestocked: "2023-06-12",
          },
          {
            id: "5",
            name: "Tapioca Pearls",
            category: "Toppings",
            sku: "TOP-TPP-001",
            currentStock: 15,
            minStock: 8,
            unit: "kg",
            costPerUnit: 12.0,
            supplier: "Bubble Tea Supplies Inc.",
            lastRestocked: "2023-06-14",
          },
        ],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState("0");

  // Form state for new/edit item
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    currentStock: 0,
    minStock: 0,
    unit: "",
    costPerUnit: 0,
    supplier: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "currentStock" || name === "minStock" || name === "costPerUnit"
          ? parseFloat(value)
          : value,
    });
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "",
      sku: "",
      currentStock: 0,
      minStock: 0,
      unit: "",
      costPerUnit: 0,
      supplier: "",
    });
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setInventoryItems(inventoryItems.filter((item) => item.id !== id));
  };

  const handleRestockItem = (item: InventoryItem) => {
    setRestockItem(item);
    setRestockAmount("0");
    setIsRestockDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.sku) return;

    if (editingItem) {
      // Update existing item
      setInventoryItems(
        inventoryItems.map((item) =>
          item.id === editingItem.id
            ? ({ ...item, ...formData } as InventoryItem)
            : item,
        ),
      );
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formData.name || "",
        category: formData.category || "",
        sku: formData.sku || "",
        currentStock: formData.currentStock || 0,
        minStock: formData.minStock || 0,
        unit: formData.unit || "",
        costPerUnit: formData.costPerUnit || 0,
        supplier: formData.supplier || "",
        lastRestocked: new Date().toISOString().split("T")[0],
      };
      setInventoryItems([...inventoryItems, newItem]);
    }

    setIsItemDialogOpen(false);
  };

  const handleConfirmRestock = () => {
    if (!restockItem) return;

    const amount = parseInt(restockAmount, 10) || 0;
    if (amount <= 0) return;

    setInventoryItems(
      inventoryItems.map((item) =>
        item.id === restockItem.id
          ? {
              ...item,
              currentStock: item.currentStock + amount,
              lastRestocked: new Date().toISOString().split("T")[0],
            }
          : item,
      ),
    );

    setIsRestockDialogOpen(false);
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "low")
      return matchesSearch && item.currentStock <= item.minStock;
    return matchesSearch;
  });

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.currentStock / item.minStock;
    if (ratio <= 0.5) return "critical";
    if (ratio <= 1) return "low";
    if (ratio <= 2) return "moderate";
    return "good";
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "critical":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Critical
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" /> Low
          </Badge>
        );
      case "moderate":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Moderate
          </Badge>
        );
      case "good":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Good
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStockProgressColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500";
      case "low":
        return "bg-yellow-500";
      case "moderate":
        return "bg-blue-500";
      case "good":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <p className="text-muted-foreground">
          Track stock levels and manage inventory items
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inventory..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Items
          </TabsTrigger>
          <TabsTrigger value="low" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <div className="flex items-center gap-1">
                        Item Name
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item);
                      const progressColor = getStockProgressColor(stockStatus);
                      const stockPercentage = Math.min(
                        Math.round(
                          (item.currentStock / (item.minStock * 2)) * 100,
                        ),
                        100,
                      );

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.sku}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  {item.currentStock} {item.unit}
                                </span>
                                {getStockBadge(stockStatus)}
                              </div>
                              <Progress
                                value={stockPercentage}
                                className={`h-2 ${progressColor}`}
                              />
                              <div className="text-xs text-muted-foreground">
                                Min: {item.minStock} {item.unit}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            QAR {item.costPerUnit.toFixed(2)}/{item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestockItem(item)}
                              >
                                Restock
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No inventory items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that need to be restocked soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">
                              {item.name}
                            </CardTitle>
                            {getStockBadge(stockStatus)}
                          </div>
                          <CardDescription>{item.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Current Stock:</span>
                              <span className="font-medium">
                                {item.currentStock} {item.unit}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Minimum Stock:</span>
                              <span className="font-medium">
                                {item.minStock} {item.unit}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Last Restocked:</span>
                              <span className="font-medium">
                                {item.lastRestocked}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestockItem(item)}
                          >
                            Restock Now
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No low stock items found.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>
                View and export inventory reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Stock Value Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Total value of current inventory
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      QAR{" "}
                      {inventoryItems
                        .reduce(
                          (total, item) =>
                            total + item.currentStock * item.costPerUnit,
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Items below minimum stock level
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      {
                        inventoryItems.filter(
                          (item) => item.currentStock <= item.minStock,
                        ).length
                      }
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Restock Needed</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Estimated cost to restock all low items
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      QAR{" "}
                      {inventoryItems
                        .filter((item) => item.currentStock <= item.minStock)
                        .reduce(
                          (total, item) =>
                            total +
                            (item.minStock - item.currentStock) *
                              item.costPerUnit,
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Order
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the details of this inventory item"
                : "Add a new item to your inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku || ""}
                onChange={handleInputChange}
                placeholder="Enter SKU"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock || 0}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock || 0}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. kg, liter, piece"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costPerUnit">Cost per Unit (QAR)</Label>
                <Input
                  id="costPerUnit"
                  name="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit || 0}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier || ""}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add inventory to {restockItem?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Stock</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">
                  {restockItem?.currentStock} {restockItem?.unit}
                </span>
                {getStockBadge(
                  restockItem ? getStockStatus(restockItem) : "good",
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="restockAmount">Amount to Add</Label>
              <Input
                id="restockAmount"
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="grid gap-2">
              <Label>New Stock Level</Label>
              <div className="text-lg font-medium">
                {(restockItem?.currentStock || 0) +
                  parseInt(restockAmount || "0", 10)}{" "}
                {restockItem?.unit}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Total Cost</Label>
              <div className="text-lg font-medium">
                QAR{" "}
                {(
                  (restockItem?.costPerUnit || 0) *
                  parseInt(restockAmount || "0", 10)
                ).toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestockDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRestock}>Confirm Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
