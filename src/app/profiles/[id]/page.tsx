import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SiteHeader } from "@/components/SiteHeader";
import { getProfile, listMeasurements } from "@/db/store";

async function ProfileDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) notFound();
  const measurements = await listMeasurements(id);
  return (
    <>
      <div className="px-5 pt-1 sm:px-8">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-sky-500"
        >
          ← Všechny profily
        </Link>
      </div>
      <Dashboard profile={profile} measurements={measurements} />
    </>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="px-5 py-16 text-[var(--muted)] sm:px-8">
            Načítám dashboard…
          </div>
        }
      >
        <ProfileDashboard params={params} />
      </Suspense>
    </>
  );
}
