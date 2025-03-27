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

    // Set the image from the preview
    data.image = imagePreview;

    // Submit the form data directly
    onSubmit(data);
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
        name: "", // Required field, but initialized with empty string
        options: [""], // Required field, initialized with empty array containing empty string
        prices: ["0"],
        required: false,
        multiSelect: false,
      },
    ] as z.infer<typeof formSchema>["customizationOptions"]);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                      <Input type="text" placeholder="0.00" {...field} />
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
                    <Textarea placeholder="Enter item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setItemType(value as "beverage" | "food");
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
                      Mark this item as available for ordering
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

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Item Image</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="upload-image"
                      name="image-source"
                      checked={imageSource === "upload"}
                      onChange={() => setImageSource("upload")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="upload-image" className="cursor-pointer">
                      Upload Image
                    </label>
                  </div>
                  {imageSource === "upload" && (
                    <div className="flex flex-col space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="url-image"
                      name="image-source"
                      checked={imageSource === "url"}
                      onChange={() => setImageSource("url")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="url-image" className="cursor-pointer">
                      Image URL
                    </label>
                  </div>
                  {imageSource === "url" && (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={imagePreview}
                          onChange={(e) => handleUrlChange(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border rounded-md p-2 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p>Image preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {itemType === "beverage" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Customization Options</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomizationOption}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                {form
                  .watch("customizationOptions")
                  ?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="border rounded-md p-4 mb-4 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <Input
                          placeholder="Option name (e.g. Size, Sugar Level)"
                          value={option.name}
                          onChange={(e) => {
                            const currentOptions =
                              form.getValues("customizationOptions") || [];
                            const updatedOptions = [...currentOptions];
                            updatedOptions[optionIndex].name = e.target.value;
                            form.setValue(
                              "customizationOptions",
                              updatedOptions,
                            );
                          }}
                          className="flex-1 mr-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomizationOption(optionIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${optionIndex}`}
                          checked={option.required}
                          onChange={(e) => {
                            const currentOptions =
                              form.getValues("customizationOptions") || [];
                            const updatedOptions = [...currentOptions];
                            updatedOptions[optionIndex].required =
                              e.target.checked;
                            form.setValue(
                              "customizationOptions",
                              updatedOptions,
                            );
                          }}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={`required-${optionIndex}`}
                          className="text-sm"
                        >
                          Required
                        </label>

                        <input
                          type="checkbox"
                          id={`multi-${optionIndex}`}
                          checked={option.multiSelect}
                          onChange={(e) => {
                            const currentOptions =
                              form.getValues("customizationOptions") || [];
                            const updatedOptions = [...currentOptions];
                            updatedOptions[optionIndex].multiSelect =
                              e.target.checked;
                            form.setValue(
                              "customizationOptions",
                              updatedOptions,
                            );
                          }}
                          className="h-4 w-4 ml-4"
                        />
                        <label
                          htmlFor={`multi-${optionIndex}`}
                          className="text-sm"
                        >
                          Allow multiple selections
                        </label>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Option Values</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addOptionValue(optionIndex)}
                            className="h-8 text-xs flex items-center gap-1"
                          >
                            <PlusCircle className="h-3 w-3" />
                            Add Value
                          </Button>
                        </div>

                        {option.options.map((value, valueIndex) => (
                          <div
                            key={valueIndex}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder="Option value (e.g. Small, Medium, Large)"
                              value={value}
                              onChange={(e) => {
                                const currentOptions =
                                  form.getValues("customizationOptions") || [];
                                const updatedOptions = [...currentOptions];
                                updatedOptions[optionIndex].options[
                                  valueIndex
                                ] = e.target.value;
                                form.setValue(
                                  "customizationOptions",
                                  updatedOptions,
                                );
                              }}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="+0.00"
                              value={option.prices?.[valueIndex] || "0"}
                              onChange={(e) => {
                                const currentOptions =
                                  form.getValues("customizationOptions") || [];
                                const updatedOptions = [...currentOptions];
                                if (!updatedOptions[optionIndex].prices) {
                                  updatedOptions[optionIndex].prices =
                                    option.options.map(() => "0");
                                }
                                if (updatedOptions[optionIndex].prices) {
                                  updatedOptions[optionIndex].prices[
                                    valueIndex
                                  ] = e.target.value;
                                }
                                form.setValue(
                                  "customizationOptions",
                                  updatedOptions,
                                );
                              }}
                              className="w-20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeOptionValue(optionIndex, valueIndex)
                              }
                              className="h-8 w-8"
                              disabled={option.options.length <= 1}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData.name ? "Update Item" : "Add Item"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default MenuItemForm;
