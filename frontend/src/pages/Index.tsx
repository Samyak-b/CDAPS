import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CitySearch } from "@/components/dashboard/city-search";
import { CityStatsCard } from "@/components/dashboard/city-stats-card";
import { TopCitiesList } from "@/components/dashboard/top-cities-list";
import { Shield, BarChart3, Calendar, AlertTriangle } from "lucide-react";
import { fetchYears, fetchCities, fetchCityStats, fetchTopCities } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  
  // Queries
  const { data: years = [], isLoading: yearsLoading } = useQuery({
    queryKey: ["years"],
    queryFn: fetchYears,
  });

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const { data: cityStats, isLoading: cityStatsLoading, error: cityStatsError } = useQuery({
    queryKey: ["cityStats", selectedCity, selectedYear],
    queryFn: () => fetchCityStats(selectedCity, undefined, selectedYear),
    enabled: !!selectedCity,
    retry: false,
  });

  const { data: topCities, isLoading: topCitiesLoading } = useQuery({
    queryKey: ["topCities", selectedYear],
    queryFn: () => fetchTopCities(15, selectedYear),
  });

  // Set default year when years are loaded
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [years, selectedYear]);

  // Handle errors
  useEffect(() => {
    if (cityStatsError) {
      toast.error(`Failed to load stats for ${selectedCity}. Please try another city.`);
    }
  }, [cityStatsError, selectedCity]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  const handleCityClickFromTop = (city: string) => {
    setSelectedCity(city);
    toast.success(`Selected ${city} for detailed analysis`);
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="border-b border-dashboard-border bg-gradient-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CDAPS</h1>
                <p className="text-muted-foreground">Real-time crime statistics and trends</p>
              </div>
            </div>
            {!yearsLoading && years.length > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Latest Data:</span>
                <Badge variant="outline">{years[years.length - 1]}</Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Search & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search Section */}
            <Card className="bg-gradient-card border-dashboard-border shadow-dashboard-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  City Analysis
                </CardTitle>
              </CardHeader>
              <div className="px-6 pb-4"><a href="/predict" className="inline-block"><button className="btn btn-primary">Go to Predictions</button></a></div>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {citiesLoading ? (
                      <Skeleton className="h-12 flex-1" />
                    ) : (
                      <CitySearch
                        cities={cities}
                        onCitySelect={handleCitySelect}
                        selectedCity={selectedCity}
                      />
                    )}
                    
                    {!yearsLoading && years.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {years.slice(-3).map((year) => (
                          <Button
                            key={year}
                            variant={selectedYear === year ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedYear(year)}
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!selectedCity && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Search for a city to view crime statistics and trends</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* City Stats */}
            {selectedCity && (
              <div>
                {cityStatsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : cityStats ? (
                  <CityStatsCard cityStats={cityStats} />
                ) : (
                  <Card className="bg-gradient-card border-dashboard-border">
                    <CardContent className="py-8 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No data available for {selectedCity} in the selected time period.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Top Cities */}
          <div className="space-y-8">
            {topCitiesLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : topCities ? (
              <TopCitiesList
                topCities={topCities}
                onCityClick={handleCityClickFromTop}
              />
            ) : (
              <Card className="bg-gradient-card border-dashboard-border">
                <CardContent className="py-8 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No top cities data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;