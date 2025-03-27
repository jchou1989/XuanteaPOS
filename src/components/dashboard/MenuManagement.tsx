import React, { useState, useEffect } from "react";
import {
  Utensils,
  Coffee,
  Plus,
  PlusCircle,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MenuItemList from "./MenuItemList";
import MenuItemForm from "./MenuItemForm";
import { useMenuData } from "./MenuDataContext";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import MenuExcelImport from "./MenuExcelImport";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  type: "beverage" | "food";
  category?: string;
  customizationOptions?: {
    sizes?: string[];
    sugarLevels?: string[];
    iceLevels?: string[];
    [key: string]: string[] | undefined;
  };
  customizationPrices?: {
    [key: string]: { [option: string]: number };
  };
  preparationNotes?: string;
  image?: string;
}

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuManagementProps {
  initialItems?: MenuItem[];
}

const MenuManagement = ({ initialItems = [] }: MenuManagementProps) => {
  const {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenuData();
  const [activeTab, setActiveTab] = useState("list");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  // Listen for Excel import categories
  useEffect(() => {
    const handleExcelImportCategories = (event: CustomEvent) => {
      const importedCategories = event.detail;
      console.log("Received imported categories:", importedCategories);

      // Add new categories that don't already exist
      if (importedCategories && importedCategories.length > 0) {
        importedCategories.forEach(
          (newCategory: { id: string; name: string }) => {
            // Check if category already exists by name
            const categoryExists = categories.some(
              (cat) => cat.name === newCategory.name,
            );
            if (!categoryExists) {
              addCategory({
                id: newCategory.id,
                name: newCategory.name,
              });
            }
          },
        );
      }
    };

    window.addEventListener(
      "excel-import-categories" as any,
      handleExcelImportCategories as EventListener,
    );

    // Broadcast menu items to all components on mount
    console.log(
      "MenuManagement: Broadcasting menu items to all components on mount",
    );
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("menu-items-updated", { detail: menuItems }),
      );
    }, 1000);

    return () => {
      window.removeEventListener(
        "excel-import-categories" as any,
        handleExcelImportCategories as EventListener,
      );
    };
  }, [categories, addCategory, menuItems]);

  const handleAddItem = () => {
    setEditingItem(null);
    setActiveTab("add");
  };

  const handleEditItem = (item: MenuItem) => {
    // Make sure we're passing the complete item with all customization options
    setEditingItem(item);
    setActiveTab("add");
  };

  const handleDeleteItem = (id: string) => {
    deleteMenuItem(id);
  };

  const handleSaveItem = (formData: any) => {
    // Process the form data
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    let updatedItems = [...menuItems];

    if (editingItem) {
      // Update existing item
      const updatedItem = { ...editingItem, ...processedData };
      updateMenuItem(updatedItem);
      updatedItems = menuItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      );
    } else {
      // Add new item
      const newItem = {
        ...processedData,
        id: `${Date.now()}`, // Generate a temporary ID
      };
      addMenuItem(newItem);
      updatedItems = [...menuItems, newItem];
    }

    // Force a refresh of the menu items list
    setActiveTab("list");
    setEditingItem(null);

    // Explicitly broadcast menu items to all components after save
    console.log("MenuManagement: Broadcasting updated menu items after save");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("menu-items-updated", { detail: updatedItems }),
      );
    }, 100);
  };

  const handleCancelEdit = () => {
    setActiveTab("list");
    setEditingItem(null);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      if (editingCategoryId) {
        updateCategory(editingCategoryId, newCategoryName.trim());
      } else {
        addCategory({
          id: Date.now().toString(),
          name: newCategoryName.trim(),
        });
      }
      setNewCategoryName("");
      setEditingCategoryId(null);
      setIsCategoryDialogOpen(false);
    }
  };

  const handleEditCategory = (category: MenuCategory) => {
    setNewCategoryName(category.name);
    setEditingCategoryId(category.id);
    setIsCategoryDialogOpen(true);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      <Card className="w-full h-full bg-white shadow-sm">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Utensils className="h-6 w-6" />
              Menu Management
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
              <Button
                onClick={handleAddItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <MenuExcelImport
              onImport={(items) => {
                items.forEach((item) => addMenuItem(item));
              }}
              menuItems={menuItems}
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Menu Items
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-0">
              <MenuItemList
                items={menuItems}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {
                            menuItems.filter(
                              (item) => item.category === category.name,
                            ).length
                          }{" "}
                          items
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add" className="mt-0">
              <MenuItemForm
                initialData={
                  editingItem
                    ? {
                        name: editingItem.name,
                        beverageId: "", // Default empty string as it doesn't exist on MenuItem
                        price: editingItem.price.toString(),
                        description: editingItem.description || "",
                        type: editingItem.type,
                        category: editingItem.category || "",
                        available: true,
                        image: editingItem.image || "",
                        imageSource: editingItem.image
                          ? editingItem.image.startsWith("data:")
                            ? "upload"
                            : "url"
                          : "upload",
                        customizationOptions: editingItem.customizationOptions
                          ? Object.entries(
                              editingItem.customizationOptions,
                            ).map(([key, options]) => {
                              const formattedKey = key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase());
                              return {
                                name: formattedKey,
                                options: options || [],
                                prices: editingItem.customizationPrices?.[key]
                                  ? options?.map((option) =>
                                      (
                                        editingItem.customizationPrices?.[
                                          key
                                        ]?.[option] || 0
                                      ).toString(),
                                    )
                                  : options?.map(() => "0"),
                                required: false, // Default to false as it doesn't exist on MenuItem
                                multiSelect: false, // Default to false as it doesn't exist on MenuItem
                              };
                            })
                          : [],
                        preparationNotes: editingItem.preparationNotes || "",
                      }
                    : undefined
                }
                onSubmit={handleSaveItem}
                onCancel={handleCancelEdit}
                categories={categories}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCategoryDialogOpen(false);
                setNewCategoryName("");
                setEditingCategoryId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              {editingCategoryId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
