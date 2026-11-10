"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";

// LatestPosts is a client component that fetches data from the API.
// Using ssr: false avoids server rendering a component that only displays
// skeleton while fetching client-side. This reduces the initial JS bundle
// and improves TBT, at the cost of a skeleton flash before data loads.
const LatestPosts = dynamic(() => import("./LatestPosts"), { ssr: false });

interface LatestPostsClientWrapperProps {
  dict: Dictionary;
  isFa: boolean;
}

export default function LatestPostsClientWrapper({
  dict,
  isFa,
}: LatestPostsClientWrapperProps) {
  return <LatestPosts dict={dict} isFa={isFa} />;
}