import { MdHomeFilled, MdTaskAlt } from "react-icons/md";

export const defaultLinks = [
  {
    to: "/",
    icon: <MdHomeFilled size={20} />,
    label: "Home",
  },
  // {
  //   to: "/profile",
  //   icon: <MdAccountCircle size={20} />,
  //   label: "Profile",
  // },
  // {
  //   to: "/journal",
  //   icon: <MdLibraryBooks size={20} />,
  //   label: "Journal",
  // },
  {
    to: "/tasks",
    icon: <MdTaskAlt size={20} />,
    label: "Tasks",
  },
];
