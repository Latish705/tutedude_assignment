import React from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { MdOutlineMenu } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { backendUrl } from "../../App";
import { useDialog } from "../../contexts/DialogContext";

export default function SideBarAdmin() {
  const { open } = useDialog(); // Access dialog context to apply overlay when dialog is open
  const [openSidebar, setOpenSidebar] = React.useState(true);
  const [user, setUser] = React.useState<any>({});
  const navigate = useNavigate();
  const isLargeScreen = true;

  React.useEffect(() => {
    setOpenSidebar(isLargeScreen);
    const getUser = async () => {
      try {
        const refreshToken = Cookies.get("refreshToken");
        const userRes = await axios.get(`${backendUrl}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        setUser(userRes.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUser();
  }, [isLargeScreen]);

  const toggleDrawer = (newOpen: any) => () => {
    setOpenSidebar(newOpen);
  };

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    navigate("/login");
  };

  const handleRedirection = (index: number) => {
    const links = ["", "friends", "profile"];
    navigate(`/${links[index]}`);
  };

  const DrawerList = (
    <Box
      sx={{
        width: 250,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      role="presentation"
      onClick={isLargeScreen ? undefined : toggleDrawer(false)}
    >
      <Link to="/admin/overview">
        <div className="flex flex-row items-center gap-2 h-12 m-2">
          <h1 className="text-xl font-bold text-primary">Fellow Friend</h1>
        </div>
      </Link>
      <Divider />
      <List>
        {["Overview", "Friends", "Profile"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleRedirection(index)}>
              <ListItemIcon>
                {/* Add icons as needed */}
                <MdOutlineMenu />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ mt: "auto", p: 2, textAlign: "center" }}>
        <h2>{user.username}</h2>
        <Button onClick={handleLogout} className="text-primary">
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <div className={`${open ? "dark-overlay" : ""}`}>
      {!isLargeScreen && (
        <Button onClick={toggleDrawer(true)} className="block">
          <MdOutlineMenu size={30} />
        </Button>
      )}
      <Drawer
        open={openSidebar}
        onClose={toggleDrawer(false)}
        variant={isLargeScreen ? "persistent" : "temporary"}
        PaperProps={{
          style: {
            background: open ? "rgba(0, 0, 0, 0.5)" : "white", // Darken sidebar when dialog is open
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
