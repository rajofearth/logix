import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import "./win7-dashboard.css";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return children;
}


