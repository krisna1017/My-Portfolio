'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setMessages(await api.get<Message[]>('/api/messages'));
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await api.put(`/api/messages/${id}/read`, {});
    load();
  }

  async function remove(id: string) {
    await api.del(`/api/messages/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      {loading ? (
        <p className="mt-4 text-muted-foreground">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No messages.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
                <Badge variant={m.read ? 'secondary' : 'default'}>
                  {m.read ? 'read' : 'new'}
                </Badge>
              </div>
              {m.subject && <p className="mt-2 text-sm">{m.subject}</p>}
              <p className="mt-1 text-sm">{m.body}</p>
              <div className="mt-3 flex gap-2">
                {!m.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead(m.id)}
                  >
                    Mark read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(m.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
