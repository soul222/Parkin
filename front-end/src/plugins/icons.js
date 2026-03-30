import { library } from "@fortawesome/fontawesome-svg-core";

// Solid icons (fas)
import {
  faHouse,
  faClipboardList,
  faUsers,
  faUser,
  faSignOutAlt,
  faCar,
  faMotorcycle,
  faSpinner,
  faChartLine,
  faGear,
  faMoon,
  faSun,
  faSync,
  faFileArrowDown,
  faSliders,
  faCalendar,
  faExclamation,
  faCircleXmark,
  faCircleCheck,
  faCircleInfo,
  faBell,
  faWifi,
  faShieldHalved,
  faEye,
  faEyeSlash,
  faPen,
  faTrash,
  faPlus,
  faSearch,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Regular icons (far)
import {
  faBell as faBellRegular,
  faUser as faUserRegular,
} from "@fortawesome/free-regular-svg-icons";

// Register all icons to the library
library.add(
  // Navigation
  faHouse,
  faClipboardList,
  faUsers,
  faUser,
  faSignOutAlt,
  faGear,
  // Vehicle
  faCar,
  faMotorcycle,
  // UI States
  faSpinner,
  faSync,
  faCircleXmark,
  faCircleCheck,
  faCircleInfo,
  faExclamation,
  // Charts & Data
  faChartLine,
  faFileArrowDown,
  faSliders,
  faCalendar,
  // Theme
  faMoon,
  faSun,
  // Notifications
  faBell,
  faBellRegular,
  // Misc
  faWifi,
  faShieldHalved,
  faEye,
  faEyeSlash,
  faPen,
  faTrash,
  faPlus,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faUserRegular
);
