"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  // Minimal landing redirect. Once session management is implemented
  // this will validate the JWT and redirect to the proper dashboard.
  const ck = cookies();
  const session = ck.get("session");
  if (session) {
    redirect("/admin");
  }
  redirect("/login");
}
