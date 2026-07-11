import { useState, useEffect, useRef } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CitySearchProps {
  cities: string[];
  onCitySelect: (city: string) => void;
  selectedCity?: string;
}

export function CitySearch({ cities, onCitySelect, selectedCity }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = cities
        .filter(city =>
          city.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10);
      setFilteredCities(filtered);
      setShowDropdown(true);
      setHighlightedIndex(-1);
    } else {
      setFilteredCities([]);
      setShowDropdown(false);
    }
  }, [searchQuery, cities]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredCities.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleCitySelect(filteredCities[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    setSearchQuery(city);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setSearchQuery("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <SearchInput
        placeholder="Search cities in India..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        onFocus={() => {
          if (filteredCities.length > 0) setShowDropdown(true);
        }}
      />
      
      {showDropdown && filteredCities.length > 0 && (
        <Card className="absolute top-full mt-1 w-full z-50 p-2 bg-dashboard-card border-dashboard-border shadow-dashboard-lg max-h-60 overflow-y-auto">
          {filteredCities.map((city, index) => (
            <div
              key={city}
              className={cn(
                "flex items-center gap-2 p-2 rounded cursor-pointer transition-smooth",
                index === highlightedIndex
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-muted/50",
                selectedCity === city && "bg-primary/10 text-primary"
              )}
              onClick={() => handleCitySelect(city)}
            >
              <MapPin className="h-4 w-4" />
              <span>{city}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}