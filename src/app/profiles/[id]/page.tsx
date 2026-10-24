import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SiteHeader } from "@/components/SiteHeader";
import { getProfile, listMeasurements } from "@/db/store";

async function ProfileDashboard({ id }: { id: string }) {
  const profile = await getProfile(id);
  if (!profile) notFound();
  const measurements = await listMeasurements(id);
  return <Dashboard profile={profile} measurements={measurements} />;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <div className="px-5 pt-1 sm:px-8">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--teal)]"
        >
          ← Všechny profily
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="px-5 py-16 text-[var(--muted)] sm:px-8">
            Načítám dashboard…
          </div>
        }
      >
        <ProfileDashboard id={id} />
      </Suspense>
    </>
  );
}
