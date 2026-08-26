import type { Metadata } from "next";
import { pageTitle } from "../../lib/site/metadata";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = pageTitle("Dashboard");

export default function DashboardPage() {
  return <DashboardContent />;
}
