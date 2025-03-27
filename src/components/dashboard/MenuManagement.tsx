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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveItem = async (formData: any) => {
    // Show saving state
    setIsSaving(true);
    setSaveSuccess(false);

    // Process the form data
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      // Process customization options
      customizationOptions: formData.customizationOptions
        ? formData.customizationOptions.reduce((acc: any, option: any) => {
            if (
              option.name &&
              Array.isArray(option.options) &&
              option.options.length > 0
            ) {
              const key = option.name.toLowerCase().replace(/\s+/g, "");
              acc[key] = option.options.filter(
                (opt: string) => opt.trim() !== "",
              );
            }
            return acc;
          }, {})
        : {},
      // Process customization prices
      customizationPrices: formData.customizationOptions
        ? formData.customizationOptions.reduce((acc: any, option: any) => {
            if (
              option.name &&
              Array.isArray(option.options) &&
              Array.isArray(option.prices)
            ) {
              const key = option.name.toLowerCase().replace(/\s+/g, "");
              acc[key] = {};
              option.options.forEach((opt: string, index: number) => {
                if (opt.trim() !== "") {
                  acc[key][opt] = parseFloat(option.prices[index] || "0");
                }
              });
            }
            return acc;
          }, {})
        : {},
      // Process customization required flags
      customizationRequired: formData.customizationOptions
        ? formData.customizationOptions.reduce((acc: any, option: any) => {
            if (option.name) {
              const key = option.name.toLowerCase().replace(/\s+/g, "");
              acc[key] = !!option.required;
            }
            return acc;
          }, {})
        : {},
      // Process multi-select flags
      customizationMultiSelect: formData.customizationOptions
        ? formData.customizationOptions.reduce((acc: any, option: any) => {
            if (option.name) {
              const key = option.name.toLowerCase().replace(/\s+/g, "");
              acc[key] = !!option.multiSelect;
            }
            return acc;
          }, {})
        : {},
    };

    console.log("Processed form data:", processedData);

    try {
      if (editingItem) {
        // Update existing item
        const updatedItem = {
          ...processedData,
          id: editingItem.id, // Ensure ID is preserved
        };
        console.log("Updating menu item:", updatedItem);
        updateMenuItem(updatedItem);

        // Show success state
        setSaveSuccess(true);

        // Wait a moment to show success state before redirecting
        setTimeout(() => {
          // Force a refresh of the menu items list
          setActiveTab("list");
          setEditingItem(null);
          setIsSaving(false);
          setSaveSuccess(false);
        }, 1000);
      } else {
        // Add new item
        const newItem = {
          ...processedData,
          id: `${Date.now()}`, // Generate a temporary ID
        };
        console.log("Adding new menu item:", newItem);
        addMenuItem(newItem);

        // Show success state
        setSaveSuccess(true);

        // Wait a moment to show success state before redirecting
        setTimeout(() => {
          // Force a refresh of the menu items list
          setActiveTab("list");
          setEditingItem(null);
          setIsSaving(false);
          setSaveSuccess(false);
        }, 1000);
      }

      // Explicitly broadcast menu items to all components after save
      console.log("MenuManagement: Broadcasting updated menu items after save");
      window.dispatchEvent(
        new CustomEvent("menu-items-updated", { detail: menuItems }),
      );
    } catch (error) {
      console.error("Error saving menu item:", error);
      setIsSaving(false);
    }
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
              <div className="relative">
                {(isSaving || saveSuccess) && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 rounded-lg">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                      {isSaving && !saveSuccess && (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                          <p>Saving changes...</p>
                        </>
                      )}
                      {saveSuccess && (
                        <>
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p>Item saved successfully!</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
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
                                    ? Array.isArray(options)
                                      ? options.map((option) =>
                                          (
                                            editingItem.customizationPrices?.[
                                              key
                                            ]?.[option] || 0
                                          ).toString(),
                                        )
                                      : []
                                    : Array.isArray(options)
                                      ? options.map(() => "0")
                                      : [],
                                  required:
                                    editingItem.customizationRequired?.[key] ||
                                    false,
                                  multiSelect:
                                    editingItem.customizationMultiSelect?.[
                                      key
                                    ] || false,
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
              </div>
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
