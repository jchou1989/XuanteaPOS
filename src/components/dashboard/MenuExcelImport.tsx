import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Download, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import * as XLSX from "xlsx";

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

interface MenuExcelImportProps {
  onImport: (items: MenuItem[]) => void;
  menuItems: MenuItem[];
}

const MenuExcelImport = ({ onImport, menuItems }: MenuExcelImportProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportToExcel = () => {
    // Create data for Excel export with the specified header sequence
    const headers = [
      "Category",
      "Name",
      "Size",
      "Sugar Level",
      "Ice Level",
      "Price",
      "Description",
      "Type",
      "Preparation Notes",
      "Image URL",
    ];

    const excelData = [
      headers,
      ...menuItems.map((item) => {
        const sizes = item.customizationOptions?.sizes?.join("|") || "";
        const sugarLevels =
          item.customizationOptions?.sugarLevels?.join("|") || "";
        const iceLevels = item.customizationOptions?.iceLevels?.join("|") || "";

        return [
          item.category || "",
          item.name,
          sizes,
          sugarLevels,
          iceLevels,
          item.price,
          item.description || "",
          item.type,
          item.preparationNotes || "",
          item.image || "",
        ];
      }),
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Menu Items");

    // Generate XLSX file and trigger download
    XLSX.writeFile(wb, "menu_items.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        // Extract headers from first row
        const headers = jsonData[0].map((h) => String(h).toLowerCase().trim());

        // Map standard headers to our expected format
        const headerMap: { [key: string]: string } = {
          category: "category",
          name: "name",
          size: "sizes",
          "sugar level": "sugarLevels",
          "ice level": "iceLevels",
          price: "price",
          description: "description",
          type: "type",
          "preparation notes": "preparationNotes",
          "image url": "image",
        };

        // Validate required headers
        const requiredHeaders = ["name", "price", "type"];
        const mappedHeaders = headers.map(
          (h) => headerMap[h.toLowerCase()] || h,
        );
        const missingHeaders = requiredHeaders.filter(
          (header) => !mappedHeaders.includes(header),
        );

        if (missingHeaders.length > 0) {
          setImportError(
            `Missing required columns: ${missingHeaders.join(", ")}`,
          );
          return;
        }

        const importedItems: MenuItem[] = [];

        // Process data rows (skip header row)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue; // Skip empty rows

          // Create menu item from parsed values
          const item: Partial<MenuItem> = {
            id: `import-${Date.now()}-${i}`,
            customizationOptions: {},
          };

          // Map each column to the appropriate field
          headers.forEach((header, index) => {
            if (index >= row.length) return; // Skip if row doesn't have this column

            const value = row[index];
            const mappedHeader = headerMap[header.toLowerCase()] || header;

            if (value === undefined || value === null || value === "") return;

            switch (mappedHeader) {
              case "name":
                item.name = String(value);
                break;
              case "price":
                item.price =
                  typeof value === "number"
                    ? value
                    : parseFloat(String(value)) || 0;
                break;
              case "description":
                item.description = String(value);
                break;
              case "type":
                const typeValue = String(value).toLowerCase();
                item.type = typeValue === "food" ? "food" : "beverage";
                break;
              case "category":
                item.category = String(value);
                break;
              case "sizes":
              case "sugarLevels":
              case "iceLevels":
                if (!item.customizationOptions) {
                  item.customizationOptions = {};
                }
                const options = String(value)
                  .split("|")
                  .map((opt) => opt.trim())
                  .filter(Boolean);
                if (options.length > 0) {
                  item.customizationOptions[mappedHeader] = options;
                }
                break;
              case "preparationNotes":
                item.preparationNotes = String(value);
                break;
              case "image":
                item.image = String(value);
                break;
            }
          });

          // Validate required fields
          if (!item.name || item.price === undefined || !item.type) {
            continue; // Skip invalid items
          }

          importedItems.push(item as MenuItem);
        }

        if (importedItems.length === 0) {
          setImportError("No valid menu items found in the file");
          return;
        }

        // Extract unique categories from imported items
        const importedCategories = Array.from(
          new Set(
            importedItems.map((item) => item.category || "Uncategorized"),
          ),
        )
          .filter(Boolean)
          .map((categoryName) => ({
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            name: categoryName,
          }));

        // Dispatch event to update categories in MenuManagement
        if (importedCategories.length > 0) {
          window.dispatchEvent(
            new CustomEvent("excel-import-categories", {
              detail: importedCategories,
            }),
          );
        }

        onImport(importedItems);
        setImportError(null);
        setIsImportDialogOpen(false);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setImportError(
          "Failed to parse the Excel file. Please check the format.",
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExportToExcel}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Menu to Excel
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import from Excel
        </Button>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Menu Items from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with menu items. The file should have headers
              for Category, Name, Size, Sugar Level, Ice Level, etc.
            </DialogDescription>
          </DialogHeader>

          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="excel-file">Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuExcelImport;
