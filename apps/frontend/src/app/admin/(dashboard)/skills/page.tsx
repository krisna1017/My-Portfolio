'use client';

import { useEffect, useState } from 'react';
import { api, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  imageUrl?: string;
};

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Database', 'Language'];

const empty = { name: '', category: '', level: 0, imageUrl: '' };

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setItems(await api.get<Skill[]>('/api/skills'));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function reset() {
    setForm(empty);
    setEditingId(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, level: Number(form.level) };
    if (editingId) {
      await api.put(`/api/skills/${editingId}`, payload);
    } else {
      await api.post('/api/skills', payload);
    }
    reset();
    load();
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadFile(file);
      setForm({ ...form, imageUrl: url });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  function onEdit(s: Skill) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      category: s.category,
      level: s.level,
      imageUrl: s.imageUrl ?? '',
    });
  }

  async function onDelete(id: string) {
    await api.del(`/api/skills/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Manage Skills</h1>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-4"
      >
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Select category…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Level</Label>
          <Input
            type="number"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label>Image</Label>
          <Input type="file" accept="image/*" onChange={onImageChange} />
          <Input
            placeholder="…or paste image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt="preview"
              className="mt-2 h-16 w-16 rounded border object-cover"
            />
          )}
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-2">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No skills.</p>
        ) : (
          items.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="h-10 w-10 rounded border object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.category} · {s.level}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(s)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(s.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
