import { CaseStudyWithHomeTrigger } from "@/components/CaseStudyWithHomeTrigger";
import { getCaseStudies, getCaseStudy, getPublicCaseStudies } from "@/lib/case-studies";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCaseStudies().map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) {
    return {
      title: "Case study",
    };
  }

  const title = `${study.title} · Carl Stratton`;
  return {
    title,
    description: study.summary,
    robots: study.private ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: study.summary,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return notFound();

  const studies = getPublicCaseStudies();

  return <CaseStudyWithHomeTrigger key={study.slug} study={study} studies={studies} />;
}
