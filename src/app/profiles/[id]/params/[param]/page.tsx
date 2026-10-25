import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ParamDetailView } from "@/components/ParamDetailView";
import { SiteHeader } from "@/components/SiteHeader";
import { getProfile, listMeasurements } from "@/db/store";
import { isParamKey, PARAM_BY_KEY } from "@/lib/params";

async function ParamDetail({
  params,
}: {
  params: Promise<{ id: string; param: string }>;
}) {
  const { id: profileId, param } = await params;
  if (!isParamKey(param)) notFound();
  const meta = PARAM_BY_KEY[param];
  const profile = await getProfile(profileId);
  if (!profile) notFound();
  const measurements = await listMeasurements(profileId);

  return (
    <ParamDetailView
      profile={profile}
      measurements={measurements}
      meta={meta}
    />
  );
}

export default function ParamPage({
  params,
}: {
  params: Promise<{ id: string; param: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="px-5 py-16 text-[var(--muted)] sm:px-8">
            Načítám…
          </div>
        }
      >
        <ParamDetail params={params} />
      </Suspense>
    </>
  );
}
