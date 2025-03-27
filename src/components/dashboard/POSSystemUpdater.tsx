import React, { useEffect } from "react";
import { useMenuData } from "./MenuDataContext";

interface POSSystemUpdaterProps {
  onMenuItemsUpdate?: (menuItems: any[]) => void;
}

/**
 * This component listens for changes in the menu data context
 * and triggers an update to the POS system when menu items change.
 */
const POSSystemUpdater: React.FC<POSSystemUpdaterProps> = ({
  onMenuItemsUpdate,
}) => {
  const { menuItems } = useMenuData();

  useEffect(() => {
    // When menu items change, notify the parent component
    if (onMenuItemsUpdate) {
      onMenuItemsUpdate(menuItems);
    }
  }, [menuItems, onMenuItemsUpdate]);

  // This component doesn't render anything
  return null;
};

export default POSSystemUpdater;
