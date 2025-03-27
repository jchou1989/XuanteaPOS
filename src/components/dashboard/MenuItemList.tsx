import React, { useState } from "react";
import { Search, Edit, Trash2, Coffee, Pizza, Filter } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface MenuItem {
  id: string;
  beverageId?: string;
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
  customizationRequired?: {
    [key: string]: boolean;
  };
  preparationNotes?: string;
  image?: string;
}

interface MenuItemListProps {
  items?: MenuItem[];
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
}

const MenuItemList = ({
  items = [],
  onEdit = () => {},
  onDelete = () => {},
}: MenuItemListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "beverage" | "food">(
    "all",
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Menu Items</h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filterType === "all"
                    ? "All Items"
                    : filterType === "beverage"
                      ? "Beverages Only"
                      : "Food Only"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  All Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("beverage")}>
                  Beverages Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("food")}>
                  Food Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Beverage ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[200px]">Customization</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-gray-100 rounded-full w-8 h-8">
                            {item.type === "beverage" ? (
                              <Coffee className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Pizza className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.category && (
                          <Badge variant="secondary" className="capitalize">
                            {item.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.type === "beverage" && item.beverageId ? (
                          <Badge variant="outline" className="font-mono">
                            {item.beverageId}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>QAR {item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.customizationOptions &&
                        Object.keys(item.customizationOptions).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.customizationOptions).map(
                              ([key, options]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {key}
                                </Badge>
                              ),
                            )}
                          </div>
                        ) : item.preparationNotes ? (
                          <Badge variant="outline" className="text-xs">
                            Prep notes
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No menu items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemList;
