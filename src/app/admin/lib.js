import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";

export function requireAdmin() {
  if (!getAdminSession()) redirect("/admin/login");
}
