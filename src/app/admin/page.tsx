"use client";
import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => { window.location.replace("/api/admin.php"); }, []);
  return <a href="/api/admin.php">Open clinic admin</a>;
}
