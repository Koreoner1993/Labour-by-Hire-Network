import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Worker, Listing } from '@/lib/types';
import WorkerProfile from '@/components/workers/WorkerProfile';

const API_URL = process.env.API_URL || 'https://labour-by-hire-network-production.up.railway.app';

async function getWorker(id: string): Promise<{ worker: Worker; listing: Listing | null } | null> {
  try {
    const res = await fetch(`${API_URL}/api/workers/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getWorker(id);
  if (!data) return { title: 'Worker not found | Labour by Hire' };

  const { worker } = data;
  return {
    title: `${worker.name} — ${worker.trade} | Labour by Hire`,
    description: worker.bio
      ? worker.bio.slice(0, 155)
      : `${worker.name} is a verified ${worker.trade} based in ${worker.city}. Contact them free on Labour by Hire.`,
  };
}

export default async function WorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getWorker(id);
  if (!data) notFound();

  return <WorkerProfile worker={data.worker} listing={data.listing} />;
}
