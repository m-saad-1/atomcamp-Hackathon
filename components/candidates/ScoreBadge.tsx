import { Badge } from '@/components/ui/badge';

interface ScoreBadgeProps {
  score: number | null;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  if (score === null) {
    return <Badge variant="outline" className="bg-muted text-muted-foreground">Pending</Badge>;
  }

  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let colorClass = '';

  if (score >= 80) {
    colorClass = 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20';
  } else if (score >= 65) {
    colorClass = 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20';
  } else if (score >= 45) {
    colorClass = 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20';
  } else {
    colorClass = 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20';
  }

  return (
    <Badge variant={variant} className={`font-semibold ${colorClass}`}>
      {score}
    </Badge>
  );
}
