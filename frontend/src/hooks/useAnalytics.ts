import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

export interface ChoroplethData {
  city: string;
  crimes_prev: number;
  crimes_curr: number;
  pct_change: number;
}

export const useChoropleth = () => {
  return useQuery({
    queryKey: ['choropleth'],
    queryFn: async () => {
      const { data } = await api.get('/map/choropleth');
      return data; // Return full raw GeoJSON FeatureCollection
    }
  });
};

export const useCityStats = (city: string | null) => {
  return useQuery({
    queryKey: ['stats', city],
    queryFn: async () => {
      if (!city) return null;
      const { data } = await api.get(`/stats/city?city=${city}`);
      return data;
    },
    enabled: !!city
  });
};

export const useTopCities = (limit = 10) => {
  return useQuery({
    queryKey: ['top-cities', limit],
    queryFn: async () => {
      const { data } = await api.get(`/stats/top?k=${limit}`);
      return data.results as { city: string; crimes: number }[];
    }
  });
};

export const useCityList = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await api.get('/cities');
      return data.cities as string[];
    }
  });
};

export const usePredictSarima = () => {
  return useMutation({
    mutationFn: async ({ city, months }: { city: string; months: number }) => {
      const { data } = await api.post('/predict-sarima', { city, months });
      return data;
    }
  });
};

export interface DashboardStats {
  total_cities: number;
  latest_year: number;
  total_crimes_latest: number;
  top_cities: { city: string; crimes: number }[];
  growth_pct: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard-stats');
      return data as DashboardStats;
    }
  });
};

export interface GenderCrimeData {
  crime: string;
  Male: number;
  Female: number;
  Other: number;
}

export const useGenderStats = () => {
  return useQuery({
    queryKey: ['gender-breakdown'],
    queryFn: async () => {
      const { data } = await api.get('/stats/gender-breakdown');
      return data as GenderCrimeData[];
    }
  });
};

export interface TimeOfDayData {
  crime: string;
  Night: number;
  Morning: number;
  Afternoon: number;
  Evening: number;
  total: number;
}

export const useTimeOfDayStats = () => {
  return useQuery({
    queryKey: ['time-of-day-stats'],
    queryFn: async () => {
      const { data } = await api.get('/stats/time-of-day');
      return data as TimeOfDayData[];
    }
  });
};

export interface CitizenReport {
  id: number;
  city: string;
  crime_description: string;
  date_of_occurrence: string;
  time_of_occurrence: string;
  victim_age: number | null;
  victim_gender: string | null;
  status: string;
  report_details: string | null;
}

export const useCitizenReports = () => {
  return useQuery({
    queryKey: ['citizen-reports-approved'],
    queryFn: async () => {
      const { data } = await api.get('/citizen/reports');
      return data as CitizenReport[];
    }
  });
};

export const useAdminCitizenReports = () => {
  return useQuery({
    queryKey: ['citizen-reports-all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/citizen-reports');
      return data as CitizenReport[];
    }
  });
};

export const useCreateCitizenReport = () => {
  return useMutation({
    mutationFn: async (report: Omit<CitizenReport, 'id' | 'status'>) => {
      const { data } = await api.post('/citizen/report', report);
      return data;
    }
  });
};

export const useUpdateReportStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.put(`/admin/citizen-report/${id}/status`, { status });
      return data;
    }
  });
};

export const useDeleteReport = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/admin/citizen-report/${id}`);
      return data;
    }
  });
};

export interface SOSAlert {
  id: number;
  username: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: string;
}

export const useAdminSOSAlerts = () => {
  return useQuery({
    queryKey: ['sos-alerts-all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sos-alerts');
      return data as SOSAlert[];
    }
  });
};

export const useCreateSOSAlert = () => {
  return useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      const { data } = await api.post('/citizen/sos', coords);
      return data;
    }
  });
};

export const useResolveSOSAlert = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/admin/sos-alert/${id}/resolve`);
      return data;
    }
  });
};

export const useCitizenSignup = () => {
  return useMutation({
    mutationFn: async (user: any) => {
      const { data } = await api.post('/auth/citizen/signup', user);
      return data;
    }
  });
};

export const useCitizenLogin = () => {
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/citizen/login', credentials);
      return data;
    }
  });
};
