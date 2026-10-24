/**
 * Parse ROADMAP.md into structured data for the public /roadmap page.
 */

export interface RoadmapItem {
  title: string;
  description: string;
  checked: boolean;
}

export interface RoadmapSection {
  title: string;
  items: RoadmapItem[];
  checked: number;
  total: number;
  percentage: number;
}

export interface RoadmapPhase {
  title: string;
  description: string;
  sections: RoadmapSection[];
  checked: number;
  total: number;
  percentage: number;
}

/**
 * Parse the ROADMAP.md content into a structured array of phases.
 */
export function parseRoadmap(markdown: string): RoadmapPhase[] {
  const phases: RoadmapPhase[] = [];
  const lines = markdown.split("\n");

  let currentPhase: RoadmapPhase | null = null;
  let currentSection: RoadmapSection | null = null;
  let phaseDescription = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Phase heading: ## Phase N: Title
    const phaseMatch = line.match(/^## (Phase \d+:.+)$/);
    if (phaseMatch) {
      // Save previous phase
      if (currentPhase) {
        if (currentSection) {
          currentSection.checked = currentSection.items.filter((it) => it.checked).length;
          currentSection.total = currentSection.items.length;
          currentSection.percentage = currentSection.total > 0
            ? Math.round((currentSection.checked / currentSection.total) * 100)
            : 0;
          currentPhase.sections.push(currentSection);
          currentSection = null;
        }
        currentPhase.checked = currentPhase.sections.reduce((s, sec) => s + sec.checked, 0);
        currentPhase.total = currentPhase.sections.reduce((s, sec) => s + sec.total, 0);
        currentPhase.percentage = currentPhase.total > 0
          ? Math.round((currentPhase.checked / currentPhase.total) * 100)
          : 0;
        phases.push(currentPhase);
      }

      currentPhase = {
        title: phaseMatch[1].trim(),
        description: "",
        sections: [],
        checked: 0,
        total: 0,
        percentage: 0,
      };
      phaseDescription = "";
      continue;
    }

    // Phase description (italic text after phase heading)
    if (currentPhase && line.startsWith("_") && line.endsWith("_")) {
      currentPhase.description = line.replace(/^_/, "").replace(/_$/, "");
      continue;
    }

    // Section heading: ### Section Title
    const sectionMatch = line.match(/^### (.+)$/);
    if (sectionMatch && currentPhase) {
      // Save previous section
      if (currentSection) {
        currentSection.checked = currentSection.items.filter((it) => it.checked).length;
        currentSection.total = currentSection.items.length;
        currentSection.percentage = currentSection.total > 0
          ? Math.round((currentSection.checked / currentSection.total) * 100)
          : 0;
        currentPhase.sections.push(currentSection);
      }

      currentSection = {
        title: sectionMatch[1].trim(),
        items: [],
        checked: 0,
        total: 0,
        percentage: 0,
      };
      continue;
    }

    // Checklist item: - [x] or - [ ]
    // Accepts "**Title**: desc", the older "**Title** \u2014 desc" and a bare "**Title**".
    const itemMatch = line.match(/^- \[([ xX])\] \*\*(.+?)\*\*(?::|\s*\u2014)?\s*(.*)$/);
    if (itemMatch && currentSection) {
      currentSection.items.push({
        checked: itemMatch[1].toLowerCase() === "x",
        title: itemMatch[2].trim(),
        description: itemMatch[3]?.trim() ?? "",
      });
    }
  }

  // Save last phase and section
  if (currentPhase) {
    if (currentSection) {
      currentSection.checked = currentSection.items.filter((it) => it.checked).length;
      currentSection.total = currentSection.items.length;
      currentSection.percentage = currentSection.total > 0
        ? Math.round((currentSection.checked / currentSection.total) * 100)
        : 0;
      currentPhase.sections.push(currentSection);
    }
    currentPhase.checked = currentPhase.sections.reduce((s, sec) => s + sec.checked, 0);
    currentPhase.total = currentPhase.sections.reduce((s, sec) => s + sec.total, 0);
    currentPhase.percentage = currentPhase.total > 0
      ? Math.round((currentPhase.checked / currentPhase.total) * 100)
      : 0;
    phases.push(currentPhase);
  }

  return phases;
}
