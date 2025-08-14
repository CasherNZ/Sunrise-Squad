import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  forecast: Array<{
    name: string;
    high: number;
    low: number;
    description: string;
    icon: string;
  }>;
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute for settings changes
  });
}
