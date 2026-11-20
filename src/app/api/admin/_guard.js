import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

export function guard() {
  if (!getAdminSession()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return null;
}
