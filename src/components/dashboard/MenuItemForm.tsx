import React, { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  PlusCircle,
  Trash2,
  Upload,
  Link,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  beverageId: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Price must be a valid number.",
  }),
  description: z.string().optional(),
  type: z.enum(["beverage", "food"]),
  category: z.string(),
  available: z.boolean().default(true),
  customizationOptions: z
    .array(
      z.object({
        name: z.string(),
        options: z.array(z.string()),
        prices: z.array(z.string()).optional(),
        required: z.boolean().default(false),
        multiSelect: z.boolean().default(false),
      }),
    )
    .optional(),
  preparationNotes: z.string().optional(),
  image: z.string().optional(),
  imageSource: z.enum(["upload", "url"]).optional(),
});

type FormValues = z.infer<typeof formSchema> & {
  customizationOptions?: Array<{
    name: string;
    options: string[];
    prices?: string[];
    required?: boolean;
    multiSelect?: boolean;
  }>;
};

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuItemFormProps {
  initialData?: FormValues;
  onSubmit?: (data: FormValues) => void;
  onCancel?: () => void;
  categories?: MenuCategory[];
}

const MenuItemForm = ({
  initialData = {
    name: "",
    beverageId: "",
    price: "",
    description: "",
    type: "beverage" as const,
    category: "",
    available: true,
    customizationOptions: [],
    preparationNotes: "",
    image: "",
    imageSource: "upload" as const,
  },
  onSubmit = (data) => console.log("Form submitted:", data),
  onCancel = () => console.log("Form cancelled"),
  categories = [],
}: MenuItemFormProps) => {
  const [itemType, setItemType] = useState<"beverage" | "food">(
    initialData.type,
  );
  const [imageSource, setImageSource] = useState<"upload" | "url">(
    initialData.imageSource || "upload",
  );
  const [imagePreview, setImagePreview] = useState<string>(
    initialData.image || "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const generateBeverageId = (name: string) => {
    // Generate a unique 5-character alphanumeric ID based on the name
    const nameHash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const timestamp = Date.now().toString().slice(-5);
    const combined = (nameHash + timestamp).toString();

    // Take 5 characters, ensure it's alphanumeric
    let id = "";
    for (let i = 0; i < 5; i++) {
      const charCode = combined.charCodeAt(i % combined.length) % 36;
      id +=
        charCode < 10
          ? charCode.toString()
          : String.fromCharCode(charCode - 10 + 97);
    }

    return id.toUpperCase();
  };

  const handleSubmit = (data: FormValues) => {
    // Generate a unique beverageId if it's a beverage and doesn't already have one
    // or if we're editing an existing beverage and need to update the ID
    if (data.type === "beverage") {
      // Create a unique ID based on name and customization options to ensure uniqueness per variation
      const customOptionsStr = data.customizationOptions
        ? JSON.stringify(
            data.customizationOptions.map(
              (opt) => `${opt.name}:${opt.options.join(",")}`,
            ),
          )
        : "";
      data.beverageId = generateBeverageId(data.name + customOptionsStr);
    }

    // Convert customizationOptions to the format expected by the MenuItem interface
    const formattedData = {
      ...data,
      image: imagePreview,
      customizationOptions: data.customizationOptions
        ? {
            ...data.customizationOptions.reduce((acc, option) => {
              const key = option.name.toLowerCase().replace(/\s+/g, "");
              return { ...acc, [key]: option.options };
            }, {}),
          }
        : undefined,
      customizationPrices: data.customizationOptions
        ? data.customizationOptions.reduce((acc, option) => {
            const key = option.name.toLowerCase().replace(/\s+/g, "");
            const prices = option.prices || [];
            const priceMap = option.options.reduce((priceAcc, opt, index) => {
              return {
                ...priceAcc,
                [opt]: prices[index] ? parseFloat(prices[index]) : 0,
              };
            }, {});
            return { ...acc, [key]: priceMap };
          }, {})
        : undefined,
      customizationRequired: data.customizationOptions
        ? data.customizationOptions.reduce((acc, option) => {
            const key = option.name.toLowerCase().replace(/\s+/g, "");
            return { ...acc, [key]: option.required || false };
          }, {})
        : undefined,
      customizationMultiSelect: data.customizationOptions
        ? data.customizationOptions.reduce((acc, option) => {
            const key = option.name.toLowerCase().replace(/\s+/g, "");
            return { ...acc, [key]: option.multiSelect || false };
          }, {})
        : undefined,
    };
    onSubmit(formattedData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImagePreview(url);
  };

  const addCustomizationOption = () => {
    const currentOptions = form.getValues("customizationOptions") || [];
    form.setValue("customizationOptions", [
      ...currentOptions,
      {
        name: "",
        options: [""],
        prices: ["0"],
        required: false,
        multiSelect: false,
      },
    ]);
  };

  const removeCustomizationOption = (index: number) => {
    const currentOptions = form.getValues("customizationOptions") || [];
    form.setValue(
      "customizationOptions",
      currentOptions.filter((_, i) => i !== index),
    );
  };

  const addOptionValue = (optionIndex: number) => {
    const currentOptions = form.getValues("customizationOptions") || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex].options.push("");
    if (updatedOptions[optionIndex].prices) {
      updatedOptions[optionIndex].prices?.push("0");
    } else {
      updatedOptions[optionIndex].prices = updatedOptions[
        optionIndex
      ].options.map(() => "0");
    }
    form.setValue("customizationOptions", updatedOptions);
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const currentOptions = form.getValues("customizationOptions") || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex].options = updatedOptions[
      optionIndex
    ].options.filter((_, i) => i !== valueIndex);

    if (updatedOptions[optionIndex].prices) {
      updatedOptions[optionIndex].prices = updatedOptions[
        optionIndex
      ].prices?.filter((_, i) => i !== valueIndex);
    }

    form.setValue("customizationOptions", updatedOptions);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-md overflow-auto max-h-[80vh]">
      <CardHeader className="sticky top-0 bg-white z-10 border-b">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {initialData.name ? "Edit Menu Item" : "Add New Menu Item"}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto pb-24">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {itemType === "beverage" && (
                <FormField
                  control={form.control}
                  name="beverageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beverage ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Auto-generated on save"
                          {...field}
                          disabled={true}
                        />
                      </FormControl>
                      <FormDescription>
                        A unique ID will be generated when you save
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (QAR)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select
                      onValueChange={(value: "beverage" | "food") => {
                        field.onChange(value);
                        setItemType(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beverage">Beverage</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      {categories.length > 0 ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="Enter category name" {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <FormDescription>
                        Toggle if this item is currently available
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Item Image</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  type="button"
                  variant={imageSource === "upload" ? "default" : "outline"}
                  onClick={() => setImageSource("upload")}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant={imageSource === "url" ? "default" : "outline"}
                  onClick={() => setImageSource("url")}
                  className="flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Image URL
                </Button>
              </div>

              {imageSource === "upload" ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 flex flex-col items-center justify-center border-dashed border-2 gap-2"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span>Click to upload image</span>
                        <span className="text-xs text-gray-500">
                          JPG, PNG, GIF, SVG, WEBP
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imagePreview}
                      onChange={(e) => handleUrlChange(e.target.value)}
                    />
                  </div>
                  {imagePreview && (
                    <div className="w-full h-32 border rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-contain w-full h-full"
                        onError={() => setImagePreview("")}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Customization Options</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomizationOption}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>

              {form
                .watch("customizationOptions")
                ?.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Input
                          placeholder="Option name (e.g. Size, Toppings)"
                          value={option.name}
                          onChange={(e) => {
                            const currentOptions = [
                              ...(form.getValues("customizationOptions") || []),
                            ];
                            currentOptions[optionIndex].name = e.target.value;
                            form.setValue(
                              "customizationOptions",
                              currentOptions,
                            );
                          }}
                          className="max-w-xs"
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={option.required || false}
                              onCheckedChange={(checked) => {
                                const currentOptions = [
                                  ...(form.getValues("customizationOptions") ||
                                    []),
                                ];
                                currentOptions[optionIndex].required = checked;
                                form.setValue(
                                  "customizationOptions",
                                  currentOptions,
                                );
                              }}
                            />
                            <span className="text-sm">Required</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={option.multiSelect || false}
                              onCheckedChange={(checked) => {
                                const currentOptions = [
                                  ...(form.getValues("customizationOptions") ||
                                    []),
                                ];
                                currentOptions[optionIndex].multiSelect =
                                  checked;
                                form.setValue(
                                  "customizationOptions",
                                  currentOptions,
                                );
                              }}
                            />
                            <span className="text-sm">Multi-select</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomizationOption(optionIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {option.options.map((value, valueIndex) => (
                        <div
                          key={valueIndex}
                          className="flex items-center gap-2"
                        >
                          <Input
                            placeholder="Option value"
                            value={value}
                            onChange={(e) => {
                              const currentOptions = [
                                ...(form.getValues("customizationOptions") ||
                                  []),
                              ];
                              currentOptions[optionIndex].options[valueIndex] =
                                e.target.value;
                              form.setValue(
                                "customizationOptions",
                                currentOptions,
                              );
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Price"
                            value={option.prices?.[valueIndex] || "0"}
                            onChange={(e) => {
                              const currentOptions = [
                                ...(form.getValues("customizationOptions") ||
                                  []),
                              ];
                              if (!currentOptions[optionIndex].prices) {
                                currentOptions[optionIndex].prices =
                                  currentOptions[optionIndex].options.map(
                                    () => "0",
                                  );
                              }
                              currentOptions[optionIndex].prices![valueIndex] =
                                e.target.value;
                              form.setValue(
                                "customizationOptions",
                                currentOptions,
                              );
                            }}
                            className="w-20"
                            type="number"
                            min="0"
                            step="0.5"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeOptionValue(optionIndex, valueIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOptionValue(optionIndex)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            {itemType === "food" && (
              <FormField
                control={form.control}
                name="preparationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preparation Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter preparation instructions for kitchen staff"
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <CardFooter className="flex justify-end gap-2 px-0 sticky bottom-0 bg-white border-t pt-4 mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData.name ? "Update Item" : "Add Item"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MenuItemForm;
