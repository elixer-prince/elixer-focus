import { MdCalendarMonth, MdPalette, MdTimer } from "react-icons/md";

export const settingsLinks = [
  {
    label: "Calendar",
    to: "/settings/calendar",
    icon: <MdCalendarMonth size={20} aria-hidden="true" focusable="false" />,
  },
  {
    label: "Timer",
    to: "/settings/timer",
    icon: <MdTimer size={20} aria-hidden="true" focusable="false" />,
  },
  {
    label: "Themes",
    to: "/settings/themes",
    icon: <MdPalette size={20} aria-hidden="true" focusable="false" />,
  },
];
