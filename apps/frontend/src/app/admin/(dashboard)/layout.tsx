import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AdminNav } from '@/components/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) redirect('/admin/login');

  try {
    await apiFetch('/api/auth/me', {
      headers: { Cookie: `access_token=${token}` },
    });
  } catch {
    redirect('/admin/login');
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
