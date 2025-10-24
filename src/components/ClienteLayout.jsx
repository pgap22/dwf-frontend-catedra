import React from "react";
import { Outlet } from "react-router-dom";
import ClienteNavbar from "./ClienteNavBar.jsx";

export default function ClienteLayout() {
  return (
    <div>
      <ClienteNavbar />
      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
