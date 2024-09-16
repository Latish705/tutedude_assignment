import { Outlet } from "react-router-dom";
import SideBarAdmin from "../components/Sidebar/Sidebar";
import { useState } from "react";

const HomeLayout = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div className="">
      <SideBarAdmin />
      <div className="ml-[250px]">
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
