import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const skills = [
  { name: 'TypeScript', category: 'Language', level: 95 },
  { name: 'JavaScript', category: 'Language', level: 95 },
  { name: 'React', category: 'Frontend', level: 92 },
  { name: 'Next.js', category: 'Frontend', level: 90 },
  { name: 'Tailwind CSS', category: 'Frontend', level: 88 },
  { name: 'NestJS', category: 'Backend', level: 88 },
  { name: 'Node.js', category: 'Backend', level: 90 },
  { name: 'PostgreSQL', category: 'Database', level: 85 },
  { name: 'Prisma', category: 'Database', level: 82 },
  { name: 'Docker', category: 'DevOps', level: 75 },
  { name: 'Git', category: 'DevOps', level: 90 },
];

const projects = [
  {
    title: 'DevSync — Realtime Collaboration Platform',
    description:
      'Platform kolaborasi tim dengan editor dokumen realtime, presence kursor, dan komentar hidup menggunakan WebSockets. Mendukung ratusan pengguna simultan.',
    imageUrl: 'https://picsum.photos/seed/devsync/1200/800',
    repoUrl: 'https://github.com/example/devsync',
    liveUrl: 'https://devsync.example.com',
    category: 'Web App',
    featured: true,
  },
  {
    title: 'Portfolio Studio',
    description:
      'Generator portfolio berbasis CMS ringan untuk kreator. Builder drag-and-drop, tema dinamis, dan publish ke subdomain dalam satu klik.',
    imageUrl: 'https://picsum.photos/seed/portfoliostudio/1200/800',
    repoUrl: 'https://github.com/example/portfolio-studio',
    liveUrl: 'https://studio.example.com',
    category: 'Web App',
    featured: true,
  },
  {
    title: 'Commerce Dashboard',
    description:
      'Dashboard analitik e-commerce dengan chart interaktif, filter tanggal, dan ekspor laporan PDF. Terhubung ke 3 marketplace sekaligus.',
    imageUrl: 'https://picsum.photos/seed/commercedash/1200/800',
    repoUrl: 'https://github.com/example/commerce-dashboard',
    liveUrl: 'https://dash.example.com',
    category: 'Web App',
    featured: true,
  },
  {
    title: 'WeatherNow PWA',
    description:
      'Progressive Web App cuaca dengan offline cache, notifikasi harian, dan geolocation. Installable di mobile maupun desktop.',
    imageUrl: 'https://picsum.photos/seed/weathernow/1200/800',
    repoUrl: 'https://github.com/example/weathernow',
    liveUrl: 'https://weather.example.com',
    category: 'Mobile',
    featured: false,
  },
  {
    title: 'TaskFlow API',
    description:
      'REST API manajemen tugas dengan autentikasi JWT, rate limiting, dan dokumentasi OpenAPI lengkap. Diuji dengan 200+ integration test.',
    imageUrl: 'https://picsum.photos/seed/taskflow/1200/800',
    repoUrl: 'https://github.com/example/taskflow-api',
    liveUrl: '',
    category: 'Backend',
    featured: false,
  },
  {
    title: 'AI Markdown Notes',
    description:
      'Aplikasi catatan Markdown dengan asisten AI untuk merangkum, menerjemahkan, dan menyarankan tag otomatis dari konten.',
    imageUrl: 'https://picsum.photos/seed/aimarkdown/1200/800',
    repoUrl: 'https://github.com/example/ai-notes',
    liveUrl: 'https://notes.example.com',
    category: 'Web App',
    featured: false,
  },
];

const messages = [
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Project inquiry',
    body: 'Hi! Saya tertarik untuk memesan website portfolio. Bisa diskusi lebih lanjut?',
  },
  {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    subject: 'Collab',
    body: 'Halo, apakah Anda terbuka untuk kolaborasi project open-source?',
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const name = process.env.ADMIN_NAME ?? 'Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name },
  });
  console.log(`Seeded admin user: ${email}`);

  for (const s of skills) {
    const existing = await prisma.skill.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.skill.create({ data: s });
  }
  console.log(`Seeded ${skills.length} skills`);

  for (const p of projects) {
    const existing = await prisma.project.findFirst({
      where: { title: p.title },
    });
    if (!existing) await prisma.project.create({ data: p });
  }
  console.log(`Seeded ${projects.length} projects`);

  const msgCount = await prisma.message.count();
  if (msgCount === 0) {
    await prisma.message.createMany({ data: messages });
    console.log(`Seeded ${messages.length} messages`);
  } else {
    console.log('Messages already present, skipping');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
