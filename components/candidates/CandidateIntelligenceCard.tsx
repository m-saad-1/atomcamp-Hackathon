import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
interface Props {
  intelligence: any | null; // Using any to quickly accommodate the DB row structure which flattened recommendation
}

export function CandidateIntelligenceCard({ intelligence }: Props) {
  if (!intelligence) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <HelpCircle className="h-8 w-8 mb-4 opacity-50" />
          <p>No intelligence report generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary & Recommendation */}
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Intelligence Report</CardTitle>
              <CardDescription>AI-generated analysis based on available evidence</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Recommendation</span>
                <Badge variant={intelligence.overall_recommendation.includes('Not Recommended') ? 'destructive' : 'default'} className="mt-1">
                  {intelligence.overall_recommendation}
                </Badge>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-end border-l pl-3 ml-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Confidence</span>
                      <span className={`font-mono font-bold mt-1 ${intelligence.confidence_score > 80 ? 'text-green-600' : intelligence.confidence_score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {intelligence.confidence_score}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Confidence based on data completeness and consistency.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Executive Summary</h4>
            <p className="text-foreground leading-relaxed">{intelligence.executive_summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Reasoning</h4>
              <p className="text-sm">{intelligence.recommendation_reasoning}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Limitations</h4>
              <p className="text-sm">{intelligence.recommendation_limitations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {intelligence.strengths.map((s, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-medium">{s.trait}</span>
                  <span className="text-xs text-muted-foreground border-l-2 pl-2 mt-1">"{s.evidence}"</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" /> Areas for Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {intelligence.weaknesses.map((w, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-medium">{w.trait}</span>
                  <span className="text-xs text-muted-foreground border-l-2 pl-2 mt-1">"{w.evidence}"</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Missing Information & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" /> Missing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intelligence.missing_information.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {intelligence.missing_information.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No critical information explicitly missing.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" /> Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intelligence.risk_indicators.length > 0 ? (
              <ul className="space-y-4">
                {intelligence.risk_indicators.map((r, i) => (
                  <li key={i} className="flex flex-col">
                    <span className="font-medium text-sm text-red-800">{r.risk}</span>
                    <span className="text-xs text-red-600/80 border-l-2 border-red-200 pl-2 mt-1">"{r.evidence}"</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant risk indicators identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Interview Topics */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Suggested Interview Topics</CardTitle>
          <CardDescription>Based on profile gaps and key experiences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {intelligence.interview_topics.map((topic, i) => (
              <div key={i} className="bg-muted/20 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{topic.topic}</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent><p>{topic.reason}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {topic.suggested_questions.map((q, j) => (
                    <li key={j}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Assessments (Technical & Experience) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Technical Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase font-semibold text-muted-foreground">Backend</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {intelligence.technical_assessment.backend.map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-muted-foreground">Frontend</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {intelligence.technical_assessment.frontend.map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-muted-foreground">Cloud & DevOps</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[...intelligence.technical_assessment.cloud_experience, ...intelligence.technical_assessment.devops].map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Experience Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-semibold block mb-1">Career Progression</span>
                <p className="text-muted-foreground">{intelligence.experience_assessment.career_progression}</p>
              </div>
              <div>
                <span className="font-semibold block mb-1">Role Growth</span>
                <p className="text-muted-foreground">{intelligence.experience_assessment.role_growth}</p>
              </div>
              <div>
                <span className="font-semibold block mb-1">Domain Exposure</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {intelligence.experience_assessment.domain_exposure.map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
