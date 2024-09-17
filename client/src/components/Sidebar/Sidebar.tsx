import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

import Typography from "@mui/material/Typography";
import { useMediaQuery } from "react-responsive";
import { MdOutlineMenu } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import axios from "axios";
import { backendUrl } from "../../App";

const link = ["", "friends", "profile"];

const icons = [<InboxIcon />, <MailIcon />, <MdOutlineMenu />];

export default function SideBarAdmin() {
  const [user, setUser] = React.useState<any>({});
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const isLargeScreen = useMediaQuery({ query: "(min-width: 600px)" });

  React.useEffect(() => {
    setOpen(isLargeScreen);
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
    setOpen(newOpen);
  };

  const handleLogout = () => {
    const logoutUser = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/logout`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        });
        if (res.data.success) {
          Cookies.remove("refreshToken");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };
    logoutUser();
  };

  const handleRedirection = (index: number) => {
    navigate(`/${link[index]}`);
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
      <Link to="/">
        <div className="flex flex-row items-center gap-2 sm:gap-2 md:gap-4 xl:gap-4 h-12 m-2">
          {/* <img src={LogoC} alt="" height={30} width={30} /> */}
          <h1 className=" text-xs font-bold  text-center text-[#56B280] font-sans md:text-xl lg:text-xl">
            Fellow Friend
          </h1>
        </div>
      </Link>
      <Divider />
      <List>
        {["Overview", "Requests", "Profile"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleRedirection(index)}>
              <ListItemIcon>{icons[index]}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ mt: "auto", p: 2, textAlign: "center" }}>
        <Typography variant="h6" component="div" sx={{ mt: 1 }}>
          {user.username}
        </Typography>
        {/* <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography> */}
        <Button onClick={handleLogout} className="text-[#56B280]">
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <div>
      {!isLargeScreen && (
        <Button onClick={toggleDrawer(true)} className="block">
          <MdOutlineMenu size={30} />
        </Button>
      )}
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        variant={isLargeScreen ? "persistent" : "temporary"}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
