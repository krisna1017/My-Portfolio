'use client';

import { useEffect, useState } from 'react';
import { api, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tech?: string[];
  imageUrl?: string;
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
};

const empty = {
  title: '',
  description: '',
  category: '',
  tech: [] as string[],
  imageUrl: '',
  repoUrl: '',
  liveUrl: '',
  featured: false,
};

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [skillGroups, setSkillGroups] = useState<{ category: string; names: string[] }[]>([]);
  const [customTech, setCustomTech] = useState('');

  async function load() {
    try {
      setItems(await api.get<Project[]>('/api/projects'));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    api
      .get<{ name: string; category: string }[]>('/api/skills')
      .then((data) => {
        const order = ['Frontend', 'Backend', 'DevOps', 'Database', 'Language'];
        const map = new Map<string, string[]>();
        for (const s of data) {
          if (!map.has(s.category)) map.set(s.category, []);
          map.get(s.category)!.push(s.name);
        }
        const ordered = [
          ...order.filter((c) => map.has(c)),
          ...Array.from(map.keys()).filter((c) => !order.includes(c)),
        ];
        setSkillGroups(ordered.map((category) => ({ category, names: map.get(category)! })));
      })
      .catch(() => setSkillGroups([]));
  }, []);

  function toggleTech(name: string) {
    setForm((f) =>
      f.tech.includes(name)
        ? { ...f, tech: f.tech.filter((t) => t !== name) }
        : { ...f, tech: [...f.tech, name] },
    );
  }

  function addCustomTech() {
    const v = customTech.trim();
    if (!v || form.tech.includes(v)) {
      setCustomTech('');
      return;
    }
    setForm((f) => ({ ...f, tech: [...f.tech, v] }));
    setCustomTech('');
  }

  function reset() {
    setForm(empty);
    setEditingId(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      featured: Boolean(form.featured),
    };
    if (editingId) {
      await api.put(`/api/projects/${editingId}`, payload);
    } else {
      await api.post('/api/projects', payload);
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

  function onEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      tech: p.tech ?? [],
      imageUrl: p.imageUrl ?? '',
      repoUrl: p.repoUrl ?? '',
      liveUrl: p.liveUrl ?? '',
      featured: p.featured,
    });
  }

  async function onDelete(id: string) {
    await api.del(`/api/projects/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Manage Projects</h1>

      <form
        onSubmit={onSubmit}
        className="mt-4 space-y-3 rounded-lg border p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Tech Stack</Label>

          {/* Selected tech chips */}
          {form.tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tech.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Remove ${t}`}
                    onClick={() => toggleTech(t)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestions grouped by category */}
          {skillGroups.map((group) => (
            <div key={group.category}>
              <p className="mb-1 text-xs text-muted-foreground">
                {group.category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.names.map((name) => {
                  const selected = form.tech.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleTech(name)}
                      className={
                        'rounded-full border px-2.5 py-1 text-xs transition-colors ' +
                        (selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:bg-muted')
                      }
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom tag input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom tech…"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomTech();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomTech}>
              Add
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
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
                className="mt-2 h-24 w-40 rounded border object-cover"
              />
            )}
          </div>
          <div className="space-y-1">
            <Label>Repo URL</Label>
            <Input
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Live URL</Label>
            <Input
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm({ ...form, featured: e.target.checked })
            }
          />
          Featured
        </label>
        <div className="flex gap-2">
          <Button type="submit">
            {editingId ? 'Update' : 'Add'} Project
          </Button>
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
          <p className="text-muted-foreground">No projects.</p>
        ) : (
          items.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.category}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(p)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(p.id)}
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
