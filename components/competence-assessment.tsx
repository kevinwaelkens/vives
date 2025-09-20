"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ALL_COMPETENCES,
  STEAM_COMPETENCES,
  CT_COMPETENCES,
  COMPETENCE_LEVEL_DESCRIPTIONS,
  scoresToLevel,
  calculateOverallCompetenceLevel,
} from "@/lib/competences";
import {
  CompetenceLevel,
  type CompetenceAssessment,
  type CompetenceRubric,
} from "@/lib/competences";
import { Brain, Lightbulb, Cog, Palette, Calculator, Code } from "lucide-react";

interface CompetenceAssessmentProps {
  initialRubric?: CompetenceRubric;
  onRubricChange: (rubric: CompetenceRubric) => void;
  readonly?: boolean;
}

const competenceIcons = {
  "science-inquiry": Brain,
  "technology-integration": Cog,
  "engineering-design": Cog,
  "arts-creativity": Palette,
  "mathematical-reasoning": Calculator,
  decomposition: Code,
  "pattern-recognition": Code,
  abstraction: Code,
  "algorithm-design": Code,
  debugging: Code,
  evaluation: Code,
};

export function CompetenceAssessmentComponent({
  initialRubric,
  onRubricChange,
  readonly = false,
}: CompetenceAssessmentProps) {
  const [rubric, setRubric] = useState<CompetenceRubric>(
    initialRubric || {
      competences: ALL_COMPETENCES.map((comp) => ({
        competenceId: comp.id,
        level: CompetenceLevel.BEGINNER,
        score: 0,
        evidence: "",
        feedback: "",
      })),
      notes: "",
    },
  );

  const updateCompetenceAssessment = (
    competenceId: string,
    updates: Partial<CompetenceAssessment>,
  ) => {
    const newRubric = {
      ...rubric,
      competences: rubric.competences.map((comp) =>
        comp.competenceId === competenceId ? { ...comp, ...updates } : comp,
      ),
    };

    // Calculate overall scores
    const overall = calculateOverallCompetenceLevel(newRubric.competences);
    newRubric.overallScore = overall.score;
    newRubric.overallLevel = overall.level;

    setRubric(newRubric);
    onRubricChange(newRubric);
  };

  const updateScore = (competenceId: string, score: number) => {
    const level = scoresToLevel(score);
    updateCompetenceAssessment(competenceId, { score, level });
  };

  const updateLevel = (competenceId: string, level: CompetenceLevel) => {
    const levelDesc = COMPETENCE_LEVEL_DESCRIPTIONS[level];
    const score = Math.round(
      (levelDesc.scoreRange[0] + levelDesc.scoreRange[1]) / 2,
    );
    updateCompetenceAssessment(competenceId, { level, score });
  };

  const getCompetenceAssessment = (
    competenceId: string,
  ): CompetenceAssessment => {
    return (
      rubric.competences.find((comp) => comp.competenceId === competenceId) || {
        competenceId,
        level: CompetenceLevel.BEGINNER,
        score: 0,
      }
    );
  };

  const renderCompetenceCard = (competence: {
    id: string;
    name: string;
    description: string;
  }) => {
    const assessment = getCompetenceAssessment(competence.id);
    const levelDesc = COMPETENCE_LEVEL_DESCRIPTIONS[assessment.level];
    const Icon =
      competenceIcons[competence.id as keyof typeof competenceIcons] || Brain;

    return (
      <Card key={competence.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-lg">{competence.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {competence.description}
                </p>
              </div>
            </div>
            <Badge style={{ backgroundColor: levelDesc.color, color: "white" }}>
              {levelDesc.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!readonly && (
            <>
              {/* Score Slider */}
              <div>
                <Label className="text-sm font-medium">
                  Score: {assessment.score}/100
                </Label>
                <Slider
                  value={[assessment.score]}
                  onValueChange={([value]) => updateScore(competence.id, value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              {/* Level Selector */}
              <div>
                <Label className="text-sm font-medium">Competence Level</Label>
                <Select
                  value={assessment.level}
                  onValueChange={(value: CompetenceLevel) =>
                    updateLevel(competence.id, value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPETENCE_LEVEL_DESCRIPTIONS).map(
                      ([level, desc]) => (
                        <SelectItem key={level} value={level}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: desc.color }}
                            />
                            <span>{desc.name}</span>
                          </div>
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Evidence */}
              <div>
                <Label className="text-sm font-medium">Evidence</Label>
                <Textarea
                  placeholder="Describe specific evidence that supports this assessment..."
                  value={assessment.evidence || ""}
                  onChange={(e) =>
                    updateCompetenceAssessment(competence.id, {
                      evidence: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* Feedback */}
              <div>
                <Label className="text-sm font-medium">Feedback</Label>
                <Textarea
                  placeholder="Provide specific feedback for improvement..."
                  value={assessment.feedback || ""}
                  onChange={(e) =>
                    updateCompetenceAssessment(competence.id, {
                      feedback: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>
            </>
          )}

          {readonly && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Score:</span>
                <span className="text-sm">{assessment.score}/100</span>
              </div>
              {assessment.evidence && (
                <div>
                  <span className="text-sm font-medium">Evidence:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {assessment.evidence}
                  </p>
                </div>
              )}
              {assessment.feedback && (
                <div>
                  <span className="text-sm font-medium">Feedback:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {assessment.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const overall = calculateOverallCompetenceLevel(rubric.competences);
  const overallLevelDesc = COMPETENCE_LEVEL_DESCRIPTIONS[overall.level];

  return (
    <div className="space-y-6">
      {/* Overall Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Competence Assessment</span>
            <Badge
              style={{
                backgroundColor: overallLevelDesc.color,
                color: "white",
              }}
              className="text-sm px-3 py-1"
            >
              {overallLevelDesc.name} ({overall.score}/100)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{overallLevelDesc.description}</p>
          {!readonly && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Overall Notes</Label>
              <Textarea
                placeholder="Add general notes about the student's overall performance..."
                value={rubric.notes || ""}
                onChange={(e) => {
                  const newRubric = { ...rubric, notes: e.target.value };
                  setRubric(newRubric);
                  onRubricChange(newRubric);
                }}
                className="mt-1"
                rows={3}
              />
            </div>
          )}
          {readonly && rubric.notes && (
            <div className="mt-4">
              <span className="text-sm font-medium">Notes:</span>
              <p className="text-sm text-gray-600 mt-1">{rubric.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competence Assessments */}
      <Tabs defaultValue="steam" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="steam" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>STEAM Competences</span>
          </TabsTrigger>
          <TabsTrigger value="ct" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Computational Thinking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steam" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              STEAM Competences Assessment
            </h3>
            {STEAM_COMPETENCES.map(renderCompetenceCard)}
          </div>
        </TabsContent>

        <TabsContent value="ct" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Computational Thinking Assessment
            </h3>
            {CT_COMPETENCES.map(renderCompetenceCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
