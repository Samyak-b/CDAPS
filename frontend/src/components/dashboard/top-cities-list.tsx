import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, MapPin, Trophy } from "lucide-react";
import { TopCitiesResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TopCitiesListProps {
  topCities: TopCitiesResponse;
  onCityClick?: (city: string) => void;
}

export function TopCitiesList({ topCities, onCityClick }: TopCitiesListProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1:
      case 2:
        return <Trophy className="h-4 w-4 text-amber-500" />;
      default:
        return <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>;
    }
  };

  const getRankBadgeVariant = (index: number): "default" | "secondary" | "destructive" => {
    if (index === 0) return "destructive";
    if (index < 3) return "default";
    return "secondary";
  };

  return (
    <Card className="bg-gradient-card border-dashboard-border shadow-dashboard-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Cities by Crime Count ({topCities.year})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {topCities.results.map((city, index) => (
            <div
              key={city.city}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-smooth border border-transparent",
                "hover:bg-muted/30 hover:border-dashboard-border cursor-pointer"
              )}
              onClick={() => onCityClick?.(city.city)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{city.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {city.crimes.toLocaleString()}
                </span>
                <Badge variant={getRankBadgeVariant(index)} className="min-w-8">
                  {index + 1}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}