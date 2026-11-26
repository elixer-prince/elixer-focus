import type { IconType } from "react-icons";
import {
  MdCalendarMonth,
  MdHomeFilled,
  MdLibraryBooks,
  MdOutlineLightbulb,
  MdPerson,
  MdTaskAlt,
} from "react-icons/md";

export const defaultLinks: {
  to: string;
  icon: IconType;
  label: string;
}[] = [
  {
    to: "/",
    icon: MdHomeFilled,
    label: "Home",
  },
  {
    to: "/journal",
    icon: MdLibraryBooks,
    label: "Journal",
  },
  {
    to: "/my/brain-dump",
    icon: MdOutlineLightbulb,
    label: "Brain dump",
  },
  {
    to: "/calendar",
    icon: MdCalendarMonth,
    label: "Calendar",
  },
  {
    to: "/tasks",
    icon: MdTaskAlt,
    label: "Tasks",
  },
  {
    to: "/profile",
    icon: MdPerson,
    label: "Profile",
  },
];
