import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { FhevmProvider } from "./context/FhevmContext";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import MyOrders from "./pages/MyOrders";
import About from "./pages/About";

function AppRoutes() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders"    element={<MyOrders />} />
        <Route path="/about"     element={<About />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <FhevmProvider>
          <AppRoutes />
        </FhevmProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}