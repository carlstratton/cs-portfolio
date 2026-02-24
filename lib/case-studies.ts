import seedrsInvestorFocus from "@/content/case-studies/seedrs-investor-focus.json";
import health from "@/content/case-studies/health.json";
import healthDiscoveryLaunch from "@/content/case-studies/health-discovery-launch.json";
import platform from "@/content/case-studies/platform-investment-clarity.json";
import csIntroDoc from "@/content/case-studies/cs-intro-doc.json";
import type { CaseStudy } from "@/types/caseStudy";

const studies = [
  csIntroDoc,
  seedrsInvestorFocus,
  platform,
  healthDiscoveryLaunch,
  health,
] as CaseStudy[];

export function getCaseStudies(): CaseStudy[] {
  return studies;
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return studies.find((study) => study.slug === slug);
}
