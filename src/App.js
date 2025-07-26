import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import EventDetails from "./Components/EventDetails/EventDetails";
import MyCoupons from "./Components/MyCoupons/MyCoupons";
import MyProfile from "./Components/MyProfile/MyProfile";
import AddMember from "./Components/MyProfile/AddMember";
import Maintenance from "./Components/Maintenance/MaintenancePage";
import EntryPermission from "./Components/EntryPermission/EntryPermissionForm";
import Broadcast from "./Components/broadcast_message/Broadcast";
import SplashScreen from "./Components/SplashScreen/SplashScreen";
import CouponDetails from "./Components/MyCoupons/CouponDetails";
import NeighborDetails from "./Components/NeighborDetails/NeighborDetails";
import ServiceEntryDetails from "./Components/ServiceEntryDetails/ServiceEntryDetails"; 
import AddVehicle from "./Components/AddVehicle/AddVehicle";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/event-details"
          element={<ProtectedRoute><EventDetails /></ProtectedRoute>}
        />
        <Route
          path="/maintenance"
          element={<ProtectedRoute><Maintenance /></ProtectedRoute>}
        />
        <Route
          path="/entry-permission"
          element={<ProtectedRoute><EntryPermission /></ProtectedRoute>}
        />
        <Route
          path="/my-coupons"
          element={<ProtectedRoute><MyCoupons /></ProtectedRoute>}
        />
        <Route
          path="/coupon/:id"
          element={<ProtectedRoute><CouponDetails /></ProtectedRoute>}
        />
        <Route
          path="/my-profile"
          element={<ProtectedRoute><MyProfile /></ProtectedRoute>}
        />
        <Route
          path="/add-member"
          element={<ProtectedRoute><AddMember /></ProtectedRoute>}
        />
        <Route
          path="/broadcast-messages"
          element={<ProtectedRoute><Broadcast /></ProtectedRoute>}
        />
        <Route
          path="/neighbor-details"
          element={<ProtectedRoute><NeighborDetails /></ProtectedRoute>}
        />
        <Route
          path="/service-entries"
          element={<ProtectedRoute><ServiceEntryDetails /></ProtectedRoute>} 
        />
        <Route
          path="/add-vehicle"
          element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} 
        />
      </Routes>
    </Router>
  );
};

export default App;