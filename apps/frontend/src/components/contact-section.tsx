'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight
} from 'lucide-react';

import { Instagram, Github, Linkedin } from '@/components/icons';

export function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    body: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await api.post('/api/messages', form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', body: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <section id="contact" className="scroll-mt-12 py-16 w-full bg-black">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start ">

        {/* About Column - 5 columns */}
        <div className="col-span-6 space-y-4">
          <h1 className="text-5xl font-anton text-orange uppercase tracking-wider mb-4">Lets Work Together</h1>
          <div className="flex justify-between items-center bg-[#333333] w-full p-4 rounded-2xl border border-orange">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-lg">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-white">
                <span className='text-md font-medium'>Instagram</span>
                <span className='text-sm font-medium text-gray-400'>@krisnayd._</span>
              </div>
            </div>
            <a href="https://www.instagram.com/krisnayd._/">
              <ArrowRight className='text-orange' />
            </a>
          </div>
          <div className="flex justify-between items-center bg-[#333333] w-full p-4 rounded-2xl border border-orange">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-white">
                <span className='text-md font-medium'>GMail</span>
                <span className='text-sm font-medium text-gray-400'>yudakrisna345@gmail.com</span>
              </div>
            </div>
            <a href="mailto:yudakrisna345@gmail.com">
              <ArrowRight className='text-orange' />
            </a>
          </div>
          <div className="flex justify-between items-center bg-[#333333] w-full p-4 rounded-2xl border border-orange">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-white">
                <span className='text-md font-medium'>WhatsApp</span>
                <span className='text-sm font-medium text-gray-400'>+62 821-4502-1559</span>
              </div>
            </div>
            <a href="https://wa.me/+6282145021559">
              <ArrowRight className='text-orange' />
            </a>
          </div>
          <div className="flex justify-between items-center bg-[#333333] w-full p-4 rounded-2xl border border-orange">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-lg">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-white">
                <span className='text-md font-medium'>Github</span>
                <span className='text-sm font-medium text-gray-400'>@krisna1017</span>
              </div>
            </div>
            <a href="github.com/krisna1017">
              <ArrowRight className='text-orange' />
            </a>
          </div>
        </div>

        {/* Contact Form - 6 columns */}
        <Card className="col-span-6 bg-[#333333] mt-8 md:mt-16">
          <CardHeader>
            <CardTitle className='text-white tracking-wider text-2xl uppercase'>Send Me A Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4 text-white">
              <div className="space-y-2">
                <Label htmlFor="name" className='text-white'>Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className='text-white'>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className='text-white'>Subject (optional)</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body" className='text-white'>Message</Label>
                <Textarea
                  id="body"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={status === 'sending'} className="bg-orange ">
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </Button>
              {status === 'sent' && (
                <p className="text-sm text-green-600">Message sent!</p>
              )}
              {status === 'error' && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
