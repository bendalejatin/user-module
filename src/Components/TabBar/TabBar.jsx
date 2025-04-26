import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import CouponIcon from "@mui/icons-material/LocalActivity";
import MaintenanceIcon from "@mui/icons-material/Payment";
import ProfileIcon from "@mui/icons-material/AccountCircle";
import EntryIcon from "@mui/icons-material/ContentPaste";
import { useNavigate, useLocation } from "react-router-dom";

export default function IconLabelTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const paths = [
    "/dashboard",
    "/event-details",
    "/my-coupons",
    "/maintenance",
    "/Entry-permission",
    "/my-profile",
  ];

  const currentTab = paths.findIndex((path) =>
    location.pathname.startsWith(path)
  );
  const [value, setValue] = React.useState(currentTab === -1 ? 0 : currentTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      variant="fullWidth"
      aria-label="icon label tabs"
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        bgcolor: "background.paper",
        zIndex: 999,
        ".MuiTab-root": {
          minWidth: 0,
          padding: "6px 8px",
        },
        ".MuiTab-wrapper": {
          fontSize: "0.65rem",
          gap: "2px",
        },
      }}
    >
      <Tab
        icon={<HomeIcon fontSize="small" />}
        label={value === 0 ? "HOME" : null}
        onClick={() => navigate("/dashboard")}
      />
      <Tab
        icon={<EventIcon fontSize="small" />}
        label={value === 1 ? "EVENT" : null}
        onClick={() => navigate("/event-details")}
      />
      <Tab
        icon={<CouponIcon fontSize="small" />}
        label={value === 2 ? "COUPON" : null}
        onClick={() => navigate("/my-coupons")}
      />
      <Tab
        icon={<MaintenanceIcon fontSize="small" />}
        label={value === 3 ? "MAINTENANCE" : null}
        onClick={() => navigate("/maintenance")}
      />
      <Tab
        icon={<EntryIcon fontSize="small" />}
        label={value === 4 ? "ENTRY" : null}
        onClick={() => navigate("/Entry-permission")}
      />
      <Tab
        icon={<ProfileIcon fontSize="small" />}
        label={value === 5 ? "PROFILE" : null}
        onClick={() => navigate("/my-profile")}
      />
    </Tabs>
  );
}
