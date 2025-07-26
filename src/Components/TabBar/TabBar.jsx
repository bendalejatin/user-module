// TabBar.jsx
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import EntryIcon from "@mui/icons-material/ContentPaste";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // New icon

export default function IconLabelTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define main routes for tabs
  const tabs = [
    { path: "/dashboard", label: "HOME", icon: <HomeIcon fontSize="small" /> },
    { path: "/event-details", label: "EVENT", icon: <EventIcon fontSize="small" /> },
    { path: "/maintenance", label: "MAINTENANCE", icon: <PaymentIcon fontSize="small" /> },
    { path: "/entry-permission", label: "VISITORS", icon: <EntryIcon fontSize="small" /> },
    // { path: "/add-vehicle", label: "VEHICLE", icon: <DirectionsCarIcon fontSize="small" /> },
    { path: "/my-profile", label: "PROFILE", icon: <PersonIcon fontSize="small" /> },
    // New tab
  ];

  // Find the current tab based on the pathname
  const currentTab = tabs.findIndex((tab) =>
    location.pathname.startsWith(tab.path)
  );
  
  // Set initial value or 0 if no match found
  const [value, setValue] = React.useState(currentTab === -1 ? 0 : currentTab);

  // Update tab value when location changes
  React.useEffect(() => {
    const newTabIndex = tabs.findIndex((tab) =>
      location.pathname.startsWith(tab.path)
    );
    setValue(newTabIndex === -1 ? 0 : newTabIndex);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(tabs[newValue].path);
  };

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      variant="fullWidth"
      aria-label="navigation tabs"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        zIndex: 1200,
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.15)",
        "& .MuiTabs-indicator": {
          backgroundColor: "#3B82F6",
          height: "3px",
        },
        "& .MuiTab-root": {
          minWidth: 0,
          padding: { xs: "8px 4px", sm: "12px 8px" },
          fontSize: { xs: "0.65rem", sm: "0.75rem" },
          textTransform: "uppercase",
          "&.Mui-selected": {
            color: "#3B82F6",
            fontWeight: 600,
          },
        },
        "& .MuiSvgIcon-root": {
          fontSize: { xs: "1.3rem", sm: "1.5rem" },
          mb: { xs: 0.5, sm: 1 },
        },
        "& .MuiTab-labelIcon": {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        },
      }}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={tab.path}
          icon={tab.icon}
          label={tab.label}
          id={`nav-tab-${index}`}
          aria-controls={`nav-tabpanel-${index}`}
        />
      ))}
    </Tabs>
  );
}