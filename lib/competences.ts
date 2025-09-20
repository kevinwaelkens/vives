// STEAM & CT Competence Framework
// Based on VIVES requirements for digital assessment tool

export enum CompetenceLevel {
  BEGINNER = "BEGINNER",
  ON_THE_WAY = "ON_THE_WAY",
  JUNIOR = "JUNIOR",
  EXPERT = "EXPERT",
}

export enum STEAMCategory {
  SCIENCE = "SCIENCE",
  TECHNOLOGY = "TECHNOLOGY",
  ENGINEERING = "ENGINEERING",
  ARTS = "ARTS",
  MATHEMATICS = "MATHEMATICS",
}

export enum CTCategory {
  DECOMPOSITION = "DECOMPOSITION",
  PATTERN_RECOGNITION = "PATTERN_RECOGNITION",
  ABSTRACTION = "ABSTRACTION",
  ALGORITHM_DESIGN = "ALGORITHM_DESIGN",
  DEBUGGING = "DEBUGGING",
  EVALUATION = "EVALUATION",
}

export interface CompetenceDefinition {
  id: string;
  name: string;
  description: string;
  category: STEAMCategory | CTCategory;
  type: "STEAM" | "CT";
}

export interface CompetenceAssessment {
  competenceId: string;
  level: CompetenceLevel;
  score: number; // 0-100
  evidence?: string;
  feedback?: string;
}

export interface CompetenceRubric {
  competences: CompetenceAssessment[];
  overallScore?: number;
  overallLevel?: CompetenceLevel;
  notes?: string;
}

// STEAM Competence Definitions
export const STEAM_COMPETENCES: CompetenceDefinition[] = [
  {
    id: "science-inquiry",
    name: "Science Inquiry and Methodology",
    description:
      "Ability to formulate questions, design experiments, collect and analyze data, and draw evidence-based conclusions",
    category: STEAMCategory.SCIENCE,
    type: "STEAM",
  },
  {
    id: "technology-integration",
    name: "Technology Integration and Usage",
    description:
      "Effective use of digital tools and technologies to solve problems and enhance learning",
    category: STEAMCategory.TECHNOLOGY,
    type: "STEAM",
  },
  {
    id: "engineering-design",
    name: "Engineering Design Thinking",
    description:
      "Application of engineering design process to identify problems, brainstorm solutions, and iterate designs",
    category: STEAMCategory.ENGINEERING,
    type: "STEAM",
  },
  {
    id: "arts-creativity",
    name: "Arts and Creativity Integration",
    description:
      "Integration of creative and artistic elements to enhance problem-solving and communication",
    category: STEAMCategory.ARTS,
    type: "STEAM",
  },
  {
    id: "mathematical-reasoning",
    name: "Mathematical Reasoning and Application",
    description:
      "Use of mathematical concepts, reasoning, and problem-solving strategies in various contexts",
    category: STEAMCategory.MATHEMATICS,
    type: "STEAM",
  },
];

// Computational Thinking Competence Definitions
export const CT_COMPETENCES: CompetenceDefinition[] = [
  {
    id: "decomposition",
    name: "Decomposition",
    description:
      "Breaking down complex problems into smaller, manageable parts",
    category: CTCategory.DECOMPOSITION,
    type: "CT",
  },
  {
    id: "pattern-recognition",
    name: "Pattern Recognition",
    description:
      "Identifying similarities, patterns, and trends in data or problems",
    category: CTCategory.PATTERN_RECOGNITION,
    type: "CT",
  },
  {
    id: "abstraction",
    name: "Abstraction",
    description:
      "Focusing on essential features while ignoring irrelevant details",
    category: CTCategory.ABSTRACTION,
    type: "CT",
  },
  {
    id: "algorithm-design",
    name: "Algorithm Design",
    description: "Creating step-by-step instructions to solve problems",
    category: CTCategory.ALGORITHM_DESIGN,
    type: "CT",
  },
  {
    id: "debugging",
    name: "Debugging and Error Correction",
    description:
      "Identifying, analyzing, and fixing errors in solutions or processes",
    category: CTCategory.DEBUGGING,
    type: "CT",
  },
  {
    id: "evaluation",
    name: "Evaluation and Optimization",
    description:
      "Assessing solutions for efficiency, effectiveness, and potential improvements",
    category: CTCategory.EVALUATION,
    type: "CT",
  },
];

// All competences combined
export const ALL_COMPETENCES = [...STEAM_COMPETENCES, ...CT_COMPETENCES];

// Competence level descriptions
export const COMPETENCE_LEVEL_DESCRIPTIONS = {
  [CompetenceLevel.BEGINNER]: {
    name: "Beginner",
    description: "Initial understanding and basic application",
    scoreRange: [0, 25],
    color: "#ef4444", // red
  },
  [CompetenceLevel.ON_THE_WAY]: {
    name: "On the Way",
    description: "Developing skills with guided support",
    scoreRange: [26, 50],
    color: "#f59e0b", // amber
  },
  [CompetenceLevel.JUNIOR]: {
    name: "Junior",
    description: "Independent application with occasional guidance",
    scoreRange: [51, 75],
    color: "#3b82f6", // blue
  },
  [CompetenceLevel.EXPERT]: {
    name: "Expert",
    description: "Advanced mastery and ability to teach others",
    scoreRange: [76, 100],
    color: "#10b981", // green
  },
};

// Helper functions
export function getCompetenceById(
  id: string,
): CompetenceDefinition | undefined {
  return ALL_COMPETENCES.find((comp) => comp.id === id);
}

export function getCompetencesByType(
  type: "STEAM" | "CT",
): CompetenceDefinition[] {
  return ALL_COMPETENCES.filter((comp) => comp.type === type);
}

export function getCompetencesByCategory(
  category: STEAMCategory | CTCategory,
): CompetenceDefinition[] {
  return ALL_COMPETENCES.filter((comp) => comp.category === category);
}

export function scoresToLevel(score: number): CompetenceLevel {
  if (score >= 76) return CompetenceLevel.EXPERT;
  if (score >= 51) return CompetenceLevel.JUNIOR;
  if (score >= 26) return CompetenceLevel.ON_THE_WAY;
  return CompetenceLevel.BEGINNER;
}

export function levelToScore(level: CompetenceLevel): number {
  const ranges = COMPETENCE_LEVEL_DESCRIPTIONS[level].scoreRange;
  return Math.round((ranges[0] + ranges[1]) / 2);
}

export function calculateOverallCompetenceLevel(
  assessments: CompetenceAssessment[],
): {
  level: CompetenceLevel;
  score: number;
} {
  if (assessments.length === 0) {
    return { level: CompetenceLevel.BEGINNER, score: 0 };
  }

  const averageScore =
    assessments.reduce((sum, assessment) => sum + assessment.score, 0) /
    assessments.length;
  const level = scoresToLevel(averageScore);

  return { level, score: Math.round(averageScore) };
}
