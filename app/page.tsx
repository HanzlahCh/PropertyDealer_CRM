import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check for existing session cookie and redirect accordingly.
  // Full JWT validation will be added in the authentication branch.
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (session) {
    redirect("/admin");
  }

  redirect("/login");
}
