'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/skills', label: 'Skills' },
];

export function AdminNav() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  async function onLogout() {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // ignore
    }
    logout();
    router.push('/admin/login');
  }

  return (
    <nav className="space-y-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="block rounded px-3 py-2 text-sm hover:bg-muted"
        >
          {l.label}
        </Link>
      ))}
      <button
        onClick={onLogout}
        className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
      >
        Logout
      </button>
    </nav>
  );
}
