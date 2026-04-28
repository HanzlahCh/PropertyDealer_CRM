import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";

export default async function Home() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  // Role-based redirect
  if (session.role === "admin") {
    redirect("/admin");
  }

  redirect("/agent");
}
