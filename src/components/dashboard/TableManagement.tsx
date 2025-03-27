import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  LayoutGrid,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

interface Table {
  id: number;
  name: string;
  status: "available" | "occupied" | "reserved" | "waiting";
  occupiedSince?: Date;
  occupants?: number;
  reservedFor?: string;
  reservationTime?: Date;
  maxGuests?: number;
  reservationPhone?: string;
  occupancyEndTime?: Date;
}

interface TableManagementProps {
  initialTables?: Table[];
}

const TableManagement = ({ initialTables = [] }: TableManagementProps) => {
  // Load tables from localStorage if available, otherwise use initialTables or defaults
  const [tables, setTables] = useState<Table[]>(() => {
    const savedTables = localStorage.getItem("tableStatus");
    if (savedTables) {
      try {
        const parsed = JSON.parse(savedTables);
        // Convert string dates back to Date objects
        return parsed.map((table: any) => ({
          ...table,
          occupiedSince: table.occupiedSince
            ? new Date(table.occupiedSince)
            : undefined,
          reservationTime: table.reservationTime
            ? new Date(table.reservationTime)
            : undefined,
          occupancyEndTime: table.occupancyEndTime
            ? new Date(table.occupancyEndTime)
            : undefined,
        }));
      } catch (error) {
        console.error("Error parsing saved table status:", error);
      }
    }

    return initialTables.length > 0
      ? initialTables
      : [
          { id: 1, name: "Table 1", status: "available", maxGuests: 2 },
          { id: 2, name: "Table 2", status: "available", maxGuests: 4 },
          { id: 3, name: "Table 3", status: "available", maxGuests: 4 },
          { id: 4, name: "Table 4", status: "available", maxGuests: 6 },
          { id: 5, name: "Table 5", status: "available", maxGuests: 6 },
          { id: 6, name: "Table 6", status: "available", maxGuests: 8 },
          { id: 7, name: "Table 7", status: "available", maxGuests: 8 },
          { id: 8, name: "Table 8", status: "available", maxGuests: 10 },
          { id: 9, name: "Table 9", status: "available", maxGuests: 12 },
        ];
  });

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<
    "occupy" | "reserve" | "clear" | "edit" | "waiting" | "allocate"
  >("occupy");
  const [waitingList, setWaitingList] = useState<
    { name: string; guests: number; phone: string; time: Date }[]
  >(() => {
    const savedWaitingList = localStorage.getItem("waitingList");
    if (savedWaitingList) {
      try {
        const parsed = JSON.parse(savedWaitingList);
        return parsed.map((guest: any) => ({
          ...guest,
          time: guest.time ? new Date(guest.time) : new Date(),
        }));
      } catch (error) {
        console.error("Error parsing saved waiting list:", error);
        return [];
      }
    }
    return [];
  });

  const [noShowList, setNoShowList] = useState<
    {
      name: string;
      guests: number;
      phone: string;
      reservationTime: Date;
      tableId: number;
    }[]
  >(() => {
    const savedNoShowList = localStorage.getItem("noShowList");
    if (savedNoShowList) {
      try {
        const parsed = JSON.parse(savedNoShowList);
        return parsed.map((guest: any) => ({
          ...guest,
          reservationTime: guest.reservationTime
            ? new Date(guest.reservationTime)
            : new Date(),
        }));
      } catch (error) {
        console.error("Error parsing saved no-show list:", error);
        return [];
      }
    }
    return [];
  });

  const [activeListTab, setActiveListTab] = useState<"waiting" | "noshow">(
    "waiting",
  );
  const [reminderList, setReminderList] = useState<
    { tableId: number; name: string; time: Date; reminded: boolean }[]
  >(() => {
    const savedReminderList = localStorage.getItem("reminderList");
    if (savedReminderList) {
      try {
        const parsed = JSON.parse(savedReminderList);
        return parsed.map((reminder: any) => ({
          ...reminder,
          time: reminder.time ? new Date(reminder.time) : new Date(),
        }));
      } catch (error) {
        console.error("Error parsing saved reminder list:", error);
        return [];
      }
    }
    return [];
  });

  const [selectedWaitingGuest, setSelectedWaitingGuest] = useState<{
    name: string;
    guests: number;
    phone: string;
    time: Date;
    index: number;
  } | null>(null);

  const [occupants, setOccupants] = useState("1");
  const [reservationName, setReservationName] = useState("");
  const [reservationPhone, setReservationPhone] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [tableName, setTableName] = useState("");
  const [tableMaxGuests, setTableMaxGuests] = useState("");
  const [reservationGuests, setReservationGuests] = useState("1");
  const [waitingName, setWaitingName] = useState("");
  const [waitingGuests, setWaitingGuests] = useState("1");
  const [waitingPhone, setWaitingPhone] = useState("");

  // Save tables to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tableStatus", JSON.stringify(tables));
  }, [tables]);

  // Save waiting list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("waitingList", JSON.stringify(waitingList));
  }, [waitingList]);

  // Save no-show list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("noShowList", JSON.stringify(noShowList));
  }, [noShowList]);

  // Save reminder list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("reminderList", JSON.stringify(reminderList));
  }, [reminderList]);

  // Set default reservation time to current date and time + 1 hour when dialog opens
  useEffect(() => {
    if (dialogAction === "reserve" && isTableDialogOpen) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      // Format date as YYYY-MM-DD
      const formattedDate = now.toISOString().split("T")[0];

      // Format time as HH:MM
      const hours = oneHourLater.getHours().toString().padStart(2, "0");
      const minutes = oneHourLater.getMinutes().toString().padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      setReservationDate(formattedDate);
      setReservationTime(formattedTime);
    }
  }, [dialogAction, isTableDialogOpen]);

  // Share available tables with other components
  useEffect(() => {
    const handleRequestAvailableTables = () => {
      const availableTables = tables
        .filter((table) => table.status === "available")
        .map((table) => ({ id: table.id, name: table.name }));

      window.dispatchEvent(
        new CustomEvent("available-tables", {
          detail: availableTables,
        }),
      );
    };

    window.addEventListener(
      "request-available-tables" as any,
      handleRequestAvailableTables as EventListener,
    );

    // Dispatch available tables immediately on mount
    handleRequestAvailableTables();

    return () => {
      window.removeEventListener(
        "request-available-tables" as any,
        handleRequestAvailableTables as EventListener,
      );
    };
  }, [tables]);

  const handleTableAction = (
    table: Table,
    action: "occupy" | "reserve" | "clear" | "edit" | "waiting" | "allocate",
  ) => {
    setSelectedTable(table);
    setDialogAction(action);

    if (action === "edit") {
      setTableName(table.name);
      setTableMaxGuests(table.maxGuests?.toString() || "");
    } else if (action === "occupy") {
      setOccupants("1");
    } else if (action === "reserve") {
      setReservationName("");
      setReservationDate("");
      setReservationTime("");
      setReservationGuests("1");
      setReservationPhone("");
    } else if (action === "waiting") {
      setWaitingName("");
      setWaitingGuests("1");
      setWaitingPhone("");
    } else if (action === "allocate") {
      // Don't need to set any state here as we'll handle it in the dialog
    }

    setIsTableDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedTable) return;

    const updatedTables = [...tables];
    const tableIndex = updatedTables.findIndex(
      (t) => t.id === selectedTable.id,
    );

    if (tableIndex === -1) return;

    if (dialogAction === "occupy") {
      const guests = parseInt(occupants, 10) || 1;
      const maxGuests = updatedTables[tableIndex].maxGuests || 0;

      if (maxGuests > 0 && guests > maxGuests) {
        alert(
          `Warning: The number of guests (${guests}) exceeds the table capacity (${maxGuests}).`,
        );
        return;
      }

      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        status: "occupied",
        occupiedSince: new Date(),
        occupants: guests,
        // Set a 2-hour limit for occupancy
        occupancyEndTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      };
    } else if (dialogAction === "reserve") {
      const guests = parseInt(reservationGuests, 10) || 1;
      const maxGuests = updatedTables[tableIndex].maxGuests || 0;

      if (maxGuests > 0 && guests > maxGuests) {
        alert(
          `Warning: The number of guests (${guests}) exceeds the table capacity (${maxGuests}).`,
        );
        return;
      }

      // Combine date and time for reservation
      let reservationDateTime;
      if (reservationDate && reservationTime) {
        try {
          const [year, month, day] = reservationDate.split("-").map(Number);
          const [hours, minutes] = reservationTime.split(":").map(Number);
          reservationDateTime = new Date(year, month - 1, day, hours, minutes);
          console.log("Created reservation date:", reservationDateTime);
        } catch (error) {
          console.error("Error creating reservation date:", error);
          reservationDateTime = new Date();
        }
      }

      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        status: "reserved",
        reservedFor: reservationName,
        reservationTime: reservationDateTime,
        reservationPhone: reservationPhone,
        occupants: guests,
      };

      // Log to verify the reservation time is set correctly
      console.log("Updated table with reservation:", updatedTables[tableIndex]);

      // Add to reminder list to check after 10 minutes
      if (reservationDateTime) {
        const reminderTime = new Date(
          reservationDateTime.getTime() - 10 * 60 * 1000,
        ); // 10 minutes before
        setReminderList([
          ...reminderList,
          {
            tableId: updatedTables[tableIndex].id,
            name: reservationName,
            time: reminderTime,
            reminded: false,
          },
        ]);
      }
    } else if (dialogAction === "clear") {
      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        status: "available",
        occupiedSince: undefined,
        occupants: undefined,
        reservedFor: undefined,
        reservationTime: undefined,
        reservationPhone: undefined,
        occupancyEndTime: undefined,
      };
    } else if (dialogAction === "edit") {
      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        name: tableName,
        maxGuests:
          parseInt(tableMaxGuests, 10) || updatedTables[tableIndex].maxGuests,
      };
    } else if (dialogAction === "allocate" && selectedWaitingGuest) {
      // Allocate waiting guest to this table
      const guests = selectedWaitingGuest.guests;
      const maxGuests = updatedTables[tableIndex].maxGuests || 0;

      if (maxGuests > 0 && guests > maxGuests) {
        alert(
          `Cannot allocate: The number of guests (${guests}) exceeds the table capacity (${maxGuests}).`,
        );
        return;
      }

      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        status: "occupied",
        occupiedSince: new Date(),
        occupants: guests,
        reservedFor: selectedWaitingGuest.name,
        reservationPhone: selectedWaitingGuest.phone,
        occupancyEndTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      };

      // Remove from waiting list
      const updatedWaitingList = [...waitingList];
      updatedWaitingList.splice(selectedWaitingGuest.index, 1);
      setWaitingList(updatedWaitingList);
      setSelectedWaitingGuest(null);
    }

    setTables(updatedTables);
    // Save updated tables to localStorage
    localStorage.setItem("tableStatus", JSON.stringify(updatedTables));
    setIsTableDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Available
          </Badge>
        );
      case "occupied":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <Users className="w-3 h-3 mr-1" /> Occupied
          </Badge>
        );
      case "reserved":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="w-3 h-3 mr-1" /> Reserved
          </Badge>
        );
      case "waiting":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="w-3 h-3 mr-1" /> Waiting
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  // Check for reminders and no-shows
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      // Check for tables that need reminders
      reminderList.forEach((reminder) => {
        if (!reminder.reminded && reminder.time <= now) {
          alert(
            `Reminder: ${reminder.name}'s reservation is coming up soon for Table ${tables.find((t) => t.id === reminder.tableId)?.name}. Please contact the guest.`,
          );
          setReminderList((prev) =>
            prev.map((r) =>
              r.tableId === reminder.tableId ? { ...r, reminded: true } : r,
            ),
          );
        }
      });

      // Check for no-shows (30 minutes after reservation time)
      const updatedTables = [...tables];
      let tablesUpdated = false;
      let newNoShows = [...noShowList];

      tables.forEach((table, index) => {
        if (table.status === "reserved" && table.reservationTime) {
          const reservationTime = new Date(table.reservationTime);
          const thirtyMinutesAfter = new Date(
            reservationTime.getTime() + 30 * 60 * 1000,
          );

          if (now >= thirtyMinutesAfter) {
            // Add to no-show list
            newNoShows.push({
              name: table.reservedFor || "Unknown",
              guests: table.occupants || 0,
              phone: table.reservationPhone || "",
              reservationTime: reservationTime,
              tableId: table.id,
            });

            // Clear the table
            updatedTables[index] = {
              ...updatedTables[index],
              status: "available",
              occupiedSince: undefined,
              occupants: undefined,
              reservedFor: undefined,
              reservationTime: undefined,
              reservationPhone: undefined,
            };

            tablesUpdated = true;
          }
        }

        // Check for tables that have exceeded 2-hour limit
        if (
          table.status === "occupied" &&
          table.occupancyEndTime &&
          now >= new Date(table.occupancyEndTime)
        ) {
          alert(`Table ${table.name} has reached the 2-hour occupancy limit.`);
          // We don't automatically clear the table, just notify
        }
      });

      if (tablesUpdated) {
        setTables(updatedTables);
        // Save updated tables to localStorage when no-shows are processed
        localStorage.setItem("tableStatus", JSON.stringify(updatedTables));
        setNoShowList(newNoShows);
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [tables, reminderList, noShowList]);

  // Get available tables that can accommodate a specific number of guests
  const getAvailableTablesForGuests = (guestCount: number) => {
    return tables.filter(
      (table) =>
        table.status === "available" &&
        table.maxGuests &&
        table.maxGuests >= guestCount,
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Table Management</h2>
          <p className="text-muted-foreground">
            Manage restaurant tables and track their status
          </p>
        </div>
        <Button
          onClick={() => {
            setDialogAction("waiting");
            setIsTableDialogOpen(true);
          }}
          className="flex items-center gap-2"
          disabled={!tables.some((table) => table.status === "available")}
        >
          <Clock className="h-4 w-4" />
          Add to Waiting List
        </Button>
      </div>

      <Tabs
        defaultValue="waiting"
        onValueChange={(value) =>
          setActiveListTab(value as "waiting" | "noshow")
        }
      >
        <TabsList className="mb-2">
          <TabsTrigger value="waiting">
            Waiting List ({waitingList.length})
          </TabsTrigger>
          <TabsTrigger value="noshow">
            No-Shows ({noShowList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waiting">
          {waitingList.length > 0 ? (
            <div className="border rounded-md p-4 mb-4 bg-muted/30">
              <h3 className="font-medium mb-2">Waiting List</h3>
              <div className="space-y-2">
                {waitingList.map((guest, index) => {
                  // Get available tables that can accommodate this guest's party
                  const availableTables = getAvailableTablesForGuests(
                    guest.guests,
                  );

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {guest.guests} guests • {guest.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(guest.time)}
                        </span>
                        {availableTables.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedWaitingGuest({
                                ...guest,
                                index,
                              });
                              setDialogAction("allocate");
                              setIsTableDialogOpen(true);
                            }}
                          >
                            <ArrowRight className="h-3 w-3" />
                            Allocate
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedList = [...waitingList];
                            updatedList.splice(index, 1);
                            setWaitingList(updatedList);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="noshow">
          {noShowList.length > 0 ? (
            <div className="border rounded-md p-4 mb-4 bg-muted/30">
              <h3 className="font-medium mb-2">No-Shows</h3>
              <div className="space-y-2">
                {noShowList.map((guest, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.guests} guests • {guest.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reserved for: {formatDate(guest.reservationTime)}{" "}
                        {formatTime(guest.reservationTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedList = [...noShowList];
                          updatedList.splice(index, 1);
                          setNoShowList(updatedList);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{table.name}</CardTitle>
                    {getStatusBadge(table.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {table.status === "occupied" && (
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Guests:</span>{" "}
                        {table.occupants}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Since:</span>{" "}
                        {formatTime(table.occupiedSince)}
                      </p>
                      {table.occupancyEndTime && (
                        <p className="text-sm">
                          <span className="font-medium">Time limit:</span>{" "}
                          {formatTime(table.occupancyEndTime)}
                        </p>
                      )}
                    </div>
                  )}
                  {table.status === "reserved" && (
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Reserved for:</span>{" "}
                        {table.reservedFor}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Guests:</span>{" "}
                        {table.occupants}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Date:</span>{" "}
                        {table.reservationTime
                          ? formatDate(table.reservationTime)
                          : "Not set"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Time:</span>{" "}
                        {table.reservationTime
                          ? formatTime(table.reservationTime)
                          : "Not set"}
                      </p>
                      {table.reservationPhone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span>{" "}
                          {table.reservationPhone}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex justify-between">
                    <div className="space-x-2">
                      {table.status === "available" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleTableAction(table, "occupy")}
                          >
                            Occupy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTableAction(table, "reserve")}
                          >
                            Reserve
                          </Button>
                        </>
                      )}
                      {(table.status === "occupied" ||
                        table.status === "reserved") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleTableAction(table, "clear")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTableAction(table, "edit")}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Table</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Capacity</th>
                  <th className="text-left p-3 font-medium">Details</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.id} className="border-t">
                    <td className="p-3">{table.name}</td>
                    <td className="p-3">{getStatusBadge(table.status)}</td>
                    <td className="p-3">{table.maxGuests} guests</td>
                    <td className="p-3">
                      {table.status === "occupied" && (
                        <div>
                          <p className="text-sm">
                            {table.occupants} guests since{" "}
                            {formatTime(table.occupiedSince)}
                          </p>
                        </div>
                      )}
                      {table.status === "reserved" && (
                        <div>
                          <p className="text-sm">
                            Reserved for {table.reservedFor} at{" "}
                            {formatTime(table.reservationTime)}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="space-x-2">
                        {table.status === "available" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleTableAction(table, "occupy")}
                            >
                              Occupy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleTableAction(table, "reserve")
                              }
                            >
                              Reserve
                            </Button>
                          </>
                        )}
                        {(table.status === "occupied" ||
                          table.status === "reserved") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTableAction(table, "clear")}
                          >
                            Clear
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTableAction(table, "edit")}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog for table actions */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent>
          {dialogAction === "occupy" && (
            <>
              <DialogHeader>
                <DialogTitle>Occupy {selectedTable?.name}</DialogTitle>
                <DialogDescription>
                  Enter the number of guests for this table.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="guests" className="text-right">
                    Guests
                  </Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={selectedTable?.maxGuests || 999}
                    value={occupants}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      // Check if value exceeds max guests
                      const numValue = parseInt(value, 10) || 1;
                      const maxGuests = selectedTable?.maxGuests || 999;
                      if (numValue > maxGuests) {
                        alert(`Maximum guests for this table is ${maxGuests}`);
                        setOccupants(maxGuests.toString());
                      } else {
                        setOccupants(value);
                      }
                    }}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleConfirmAction}>Confirm</Button>
              </DialogFooter>
            </>
          )}

          {dialogAction === "reserve" && (
            <>
              <DialogHeader>
                <DialogTitle>Reserve {selectedTable?.name}</DialogTitle>
                <DialogDescription>
                  Enter reservation details for this table. Reminders will be
                  sent 10 minutes before the reservation time, and no-show
                  status will be applied after 30 minutes.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={reservationName}
                    onChange={(e) => setReservationName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={reservationPhone}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setReservationPhone(value);
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="guests" className="text-right">
                    Guests
                  </Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={reservationGuests}
                    onChange={(e) => setReservationGuests(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleConfirmAction}>Confirm</Button>
              </DialogFooter>
            </>
          )}

          {dialogAction === "edit" && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Table</DialogTitle>
                <DialogDescription>
                  Update table details and capacity.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tableName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={tableMaxGuests}
                    onChange={(e) => setTableMaxGuests(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleConfirmAction}>Save Changes</Button>
              </DialogFooter>
            </>
          )}

          {dialogAction === "clear" && (
            <>
              <DialogHeader>
                <DialogTitle>Clear {selectedTable?.name}</DialogTitle>
                <DialogDescription>
                  Are you sure you want to clear this table? This will remove
                  all current information.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTableDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmAction}>
                  Clear Table
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogAction === "waiting" && (
            <>
              <DialogHeader>
                <DialogTitle>Add to Waiting List</DialogTitle>
                <DialogDescription>
                  Enter guest details for the waiting list.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="waitingName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="waitingName"
                    value={waitingName}
                    onChange={(e) => setWaitingName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="waitingPhone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="waitingPhone"
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={waitingPhone}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setWaitingPhone(value);
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="waitingGuests" className="text-right">
                    Guests
                  </Label>
                  <Input
                    id="waitingGuests"
                    type="number"
                    min="1"
                    value={waitingGuests}
                    onChange={(e) => setWaitingGuests(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (!waitingName) {
                      alert("Please enter a name");
                      return;
                    }

                    const guests = parseInt(waitingGuests, 10) || 1;

                    setWaitingList([
                      ...waitingList,
                      {
                        name: waitingName,
                        guests,
                        phone: waitingPhone,
                        time: new Date(),
                      },
                    ]);
                    setIsTableDialogOpen(false);
                  }}
                >
                  Add to List
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogAction === "allocate" && selectedWaitingGuest && (
            <>
              <DialogHeader>
                <DialogTitle>Allocate Table</DialogTitle>
                <DialogDescription>
                  Select a table for {selectedWaitingGuest.name}'s party of{" "}
                  {selectedWaitingGuest.guests}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {tables
                      .filter(
                        (table) =>
                          table.status === "available" &&
                          table.maxGuests &&
                          table.maxGuests >= selectedWaitingGuest.guests,
                      )
                      .map((table) => (
                        <div
                          key={table.id}
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedTable(table);
                            handleConfirmAction();
                          }}
                        >
                          <div>
                            <p className="font-medium">{table.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Capacity: {table.maxGuests} guests
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTableDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManagement;
