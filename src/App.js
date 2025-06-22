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
import Maintenance from "./Components/Maintenance/MaintenancePage";
import EntryPermission from "./Components/EntryPermission/EntryPermissionForm";
import Broadcast from "./Components/broadcast_message/Broadcast";
import SplashScreen from "./Components/SplashScreen/SplashScreen";
import UserForgotPassword from "./Components/UserForgotPassword";
import UserResetPassword from "./Components/UserResetPassword";
import AddMember from "./Components/MyProfile/AddMember"; // Added import
import CouponDetails from "./Components/MyCoupons/CouponDetails"; // Added import

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
              path="/user/forgot-password"
              element={<UserForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={<UserResetPassword />}
            />
        <Route path="/splash" element={<SplashScreen />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-details"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entry-permission"
          element={
            <ProtectedRoute>
              <EntryPermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-coupons"
          element={
            <ProtectedRoute>
              <MyCoupons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/broadcast-messages"
          element={
            <ProtectedRoute>
              <Broadcast />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-member"
          element={
            <ProtectedRoute>
              <AddMember />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupon/:id" 
          element={
            <ProtectedRoute>
              <CouponDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
