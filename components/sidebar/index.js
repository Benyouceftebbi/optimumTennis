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
import NextTopLoader from "nextjs-toploader";
import { useRouter } from "next/router";
import { useState } from "react";



const items= [
  {
    name: "Calendar",
    path: "/Home/calendar",
    icon: CalendarDays
  },
  {
    name: "Dashboard",
    path: "/Home/firstpage",
    icon: LayoutDashboard,
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

    <div className=" w-full bg-white shadow-lg  p-4">

      <div className="flex flex-row space-x-10 w-full justify-between">

        <div className="flex flex-row space-x-2">
          {items.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </div>
        <img className="h-10 w-fit" src="/logo-expanded.png" alt="Logo" /> 
      </div>
    </div>
  );
};

export default Sidebar;