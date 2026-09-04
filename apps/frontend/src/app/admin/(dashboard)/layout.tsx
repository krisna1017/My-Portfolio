import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }

  const res = await fetch(`${backendUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Cookie: `access_token=${token}`,
    },
    cache: "no-store",
  });

  console.log("AUTH ME REQUEST:", {
    url: `${backendUrl}/api/auth/me`,
    hasToken: !!token,
    status: res.status,
  });

  if (!res.ok) {
    const errorText = await res.text();

    console.error("AUTH ME FAILED:", {
      status: res.status,
      body: errorText,
    });

    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      <aside className="w-48 shrink-0">
        <AdminNav />
      </aside>

      <section className="flex-1">{children}</section>
    </div>
  );
}
