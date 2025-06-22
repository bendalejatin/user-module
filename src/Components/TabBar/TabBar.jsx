import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import EntryIcon from "@mui/icons-material/ContentPaste"; // Icon for Entry
import PersonIcon from "@mui/icons-material/Person"; // Icon for Profile
import { useNavigate, useLocation } from "react-router-dom";

export default function IconLabelTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const paths = [
    "/dashboard",
    "/event-details",
    "/entry-permission",
    "/my-profile"
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
          fontSize: "0.6rem",
        },
        ".MuiTab-wrapper": {
          fontSize: "0.65rem",
          gap: "2px",
        },
      }}
    >
      <Tab
        icon={<HomeIcon fontSize="small" />}
        label="HOME"
        onClick={() => navigate("/dashboard")}
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
