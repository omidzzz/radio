"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // The legacy PHP admin dashboard (api/admin.php) is the primary admin interface.
    // This Next.js page serves as a redirect target to keep the route consistent.
    router.push("/admin.php");
  }, [router]);

  return null;
}
