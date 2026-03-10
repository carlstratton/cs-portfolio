import { Header } from "@/components/Header";
import { HomeLanding } from "@/components/HomeLanding";
import { getPublicCaseStudies } from "@/lib/case-studies";
import { Suspense } from "react";

export default function Home() {
  const studies = getPublicCaseStudies();

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
