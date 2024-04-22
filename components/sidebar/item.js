"use client";
import { useMemo, useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import SubMenuItem from "./sub-item";



const SidebarItem = ({ item }) => {
  const { name, icon: Icon, items, path } = item;
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const onClick = () => {
    if (items && items.length > 0) {
      return setExpanded(!expanded);
    }

    return router.push(path);
  };
  const isActive = useMemo(() => {
    if (items && items.length > 0) {
      if (items.find((item) => item.path === pathname)) {
        setExpanded(true);
        return true;
      }
    }

    return path === pathname;
  }, [items, path, pathname]);

  return (
    <div className="relative">  
      <div
className={`flex items-center space-x-2 p-2 rounded-md  rounded-md rounded-md      ${isActive && 'sidebar-Button-blue text-white'}`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-2 ">
          <Icon size={20} className='w-6 h-6'/>
          <p className="" style={{ cursor: 'pointer' }}>{name} </p>
        </div>
        {items && items.length > 0 && <ChevronDown size={18} />}
      </div>
      {expanded && items && items.length > 0 && (
        <div className="flex flex-col space-y-1  absolute items-center bg-white w-full">
          {items.map((item) => (
            <SubMenuItem key={item.path} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;