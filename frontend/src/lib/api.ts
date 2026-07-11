import { API_BASE } from '../config/api';

export interface CityStat {
  city: string;
  year_prev: number;
  year_curr: number;
  crimes_prev: number;
  crimes_curr: number;
  pct_change: number;
}

export interface TopCity {
  city: string;
  crimes: number;
}

export interface TopCitiesResponse {
  year: number;
  results: TopCity[];
}

export interface YearsResponse {
  years: number[];
}

export interface CitiesResponse {
  cities: string[];
}

// API Functions
export async function fetchYears(): Promise<number[]> {
  const response = await fetch(`${API_BASE}/years`);
  if (!response.ok) throw new Error('Failed to fetch years');
  const data: YearsResponse = await response.json();
  return data.years;
}

export async function fetchCities(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/cities`);
  if (!response.ok) throw new Error('Failed to fetch cities');
  const data: CitiesResponse = await response.json();
  return data.cities;
}

export async function fetchCityStats(
  city: string,
  yearPrev?: number,
  yearCurr?: number
): Promise<CityStat> {
  const params = new URLSearchParams({ city });
  if (yearPrev) params.append('year_prev', yearPrev.toString());
  if (yearCurr) params.append('year_curr', yearCurr.toString());
  
  const response = await fetch(`${API_BASE}/stats/city?${params}`);
  if (!response.ok) throw new Error('Failed to fetch city stats');
  return response.json();
}

export async function fetchTopCities(k: number = 20, year?: number): Promise<TopCitiesResponse> {
  const params = new URLSearchParams({ k: k.toString() });
  if (year) params.append('year', year.toString());
  
  const response = await fetch(`${API_BASE}/stats/top?${params}`);
  if (!response.ok) throw new Error('Failed to fetch top cities');
  return response.json();
}

export interface PredictionRow {
  city: string;
  crime_group: string;
  year_month: string;
  crime_count: number;
}

export async function fetchPredictions(city: string, months: number = 6): Promise<any> {
  const params = new URLSearchParams();
  params.append('city', city);
  params.append('months_ahead', months.toString());
  const response = await fetch(`${API_BASE}/predict?${params}`);
  if (!response.ok) {
    const txt = await response.text();
    throw new Error('Failed to fetch predictions: ' + txt);
  }
  return response.json();
}
