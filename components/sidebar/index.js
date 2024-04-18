"use client";
import {
  LucideIcon,
  LayoutDashboard,
  BadgeDollarSign,
  CircleUserRound,
  Settings,
  WalletCards,
  CalendarDays,
  LandPlot,
  Users2,
  Medal,
  CircleDollarSign,
  Trophy,
  Bell
} from "lucide-react";
import SidebarItem from "./item";



const items= [
  {
    name: "Dashboard",
    path: "/Home/firstpage",
    icon: LayoutDashboard,
  },
  {
    name: "Calendar",
    path: "/Home/calendar",
    icon: CalendarDays
  },
  {
    name: "Classes",
    path: "/Home/classes",
    icon: LandPlot,
  },
  {
    name: "Coaches",
    path: "/Home/coaches",
    icon: Users2,
  },
  {
    name: "Clients",
    path: "/Home/players",
    icon: CircleUserRound,
  },
  {
    name: "Booking",
    path: "/Home/matches",
    icon: Medal,
  },
  {
    name: "Tournaments",
    path: "/Home/tournaments",
    icon: Trophy,
  },
  // {
  //   name: "Notifications",
  //   path: "/Home/Notifications",
  //   icon: Bell,
  // },
  {
    name: "Billing",
    path: "/Home/payment",
    icon: CircleDollarSign,
    items: [
      {
        name: "Invoices",
        path: "/Home/payment",
      },
      {
        name: "Payouts",
        path: "/Home/payment/coaches",
      },
    ],
  },
  {
    name: "Settings",
    path: "/Home/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  return (

    <div className="fixed top-0 left-0 min-h-screen w-64 bg-white shadow-lg  p-4">
      <div className="flex flex-col space-y-10 w-full">
     <img className="h-50 w-fit" src="/logo-expanded.png" alt="Logo" /> 
        <div className="flex flex-col space-y-2">
          {items.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;