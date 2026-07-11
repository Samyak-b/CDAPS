import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MapPin, Calendar } from "lucide-react";
import { CityStat } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CityStatsCardProps {
  cityStats: CityStat;
}

export function CityStatsCard({ cityStats }: CityStatsCardProps) {
  const isIncrease = cityStats.pct_change > 0;
  const isDecrease = cityStats.pct_change < 0;
  const isFlat = cityStats.pct_change === 0;

  const getTrendIcon = () => {
    if (isIncrease) return <TrendingUp className="h-4 w-4" />;
    if (isDecrease) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  const getTrendColor = () => {
    if (isIncrease) return "text-destructive";
    if (isDecrease) return "text-success";
    return "text-muted-foreground";
  };

  const getTrendBadgeVariant = (): "destructive" | "secondary" | "default" => {
    if (isIncrease) return "destructive";
    if (isDecrease) return "secondary";
    return "default";
  };

  return (
    <Card className="bg-gradient-card border-dashboard-border shadow-dashboard-md hover:shadow-dashboard-lg transition-smooth">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          {cityStats.city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              {cityStats.year_prev}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {cityStats.crimes_prev.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              {cityStats.year_curr}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {cityStats.crimes_curr.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-dashboard-border">
          <span className="text-sm text-muted-foreground">Year-over-Year Change</span>
          <Badge 
            variant={getTrendBadgeVariant()} 
            className={cn(
              "flex items-center gap-1",
              getTrendColor()
            )}
          >
            {getTrendIcon()}
            {Math.abs(cityStats.pct_change)}%
            {isFlat && " No Change"}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Crime count comparison between {cityStats.year_prev} and {cityStats.year_curr}
        </div>
      </CardContent>
    </Card>
  );
}