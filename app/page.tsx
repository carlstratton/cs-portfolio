import { Header } from "@/components/Header";
import { HomeLanding } from "@/components/HomeLanding";
import { getCaseStudies } from "@/lib/case-studies";
import { Suspense } from "react";

export default function Home() {
  const studies = getCaseStudies();

  return (
    <>
      <Header />
      <main>
        <Suspense fallback={null}>
          <HomeLanding studies={studies} />
        </Suspense>
      </main>
    </>
  );
}
