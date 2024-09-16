import { Outlet } from "react-router-dom";
import SideBarAdmin from "../components/Sidebar/Sidebar";

const HomeLayout = () => {
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
