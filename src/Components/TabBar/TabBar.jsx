import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EntryIcon from "@mui/icons-material/ContentPaste"; // Icon for Entry
import PersonIcon from "@mui/icons-material/Person"; // Icon for Profile
import PaymentIcon from "@mui/icons-material/Payment"; // Icon for Maintenance
import { useNavigate, useLocation } from "react-router-dom";

export default function IconLabelTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const paths = [
    "/dashboard",
    "/event-details",
    "/entry-permission",
    "/my-profile",
    "/maintenance"
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
        boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
        ".MuiTab-root": {
          minWidth: 0,
          padding: { xs: "6px 4px", sm: "6px 8px" },
          fontSize: { xs: "0.55rem", sm: "0.6rem" },
        },
        ".MuiTab-wrapper": {
          fontSize: { xs: "0.6rem", sm: "0.65rem" },
          gap: "2px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textTransform: "uppercase",
        },
        ".MuiSvgIcon-root": {
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        },
        ".Mui-selected": {
          color: "#3B82F6",
          fontWeight: 600,
        },
        ".MuiTabs-indicator": {
          backgroundColor: "#3B82F6",
          height: "3px",
        },
      }}
    >
      <Tab
        icon={<HomeIcon fontSize="small" />}
        label="HOME"
        onClick={() => navigate("/dashboard")}
      />
      <Tab
        icon={<PaymentIcon fontSize="small" />}
        label="MAINTENANCE"
        onClick={() => navigate("/maintenance")}
      />
      <Tab
        icon={<EventIcon fontSize="small" />}
        label="EVENT"
        onClick={() => navigate("/event-details")}
      />
      <Tab
        icon={<EntryIcon fontSize="small" />}
        label="ENTRY"
        onClick={() => navigate("/entry-permission")}
      />
      <Tab
        icon={<PersonIcon fontSize="small" />}
        label="PROFILE"
        onClick={() => navigate("/my-profile")}
      />
    </Tabs>
  );
}