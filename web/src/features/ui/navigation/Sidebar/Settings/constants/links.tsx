import { MdTimer, MdPalette } from "react-icons/md";

export const settingsLinks = [
  {
    label: "Timer",
    to: "/settings/timer",
    icon: <MdTimer size={20} />,
  },
  {
    label: "Themes",
    to: "/settings/themes",
    icon: <MdPalette size={20} />,
  },
];
