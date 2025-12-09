// Shared singleton instances for manager modules
// Similar pattern to Instances.js

import { ManagerObject } from "./ManagerObject.js";
import { ManagerUtilities } from "./ManagerUtilities.js";
import { ManagerDisplay } from "./ManagerDisplays.js";
import { ManagerEventBinder } from "./ManagerEventBinder.js";

export const managerObj = new ManagerObject();
export const managerUtils = new ManagerUtilities();
export const managerDisplay = new ManagerDisplay();
export const eventBinder = new ManagerEventBinder();