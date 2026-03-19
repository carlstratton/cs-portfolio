import aiProjects from "@/content/ai-projects.json";
import type { AIProject } from "@/types/aiProject";

export function getAIProjects(): AIProject[] {
  return aiProjects as AIProject[];
}
