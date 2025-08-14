import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sun, Cloud, CloudRain } from "lucide-react";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function WeatherModal({ isOpen, onClose }: WeatherModalProps) {
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    enabled: isOpen,
  });

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('cloud')) return <Cloud size={24} className="text-gray-500" />;
    if (icon.includes('rain')) return <CloudRain size={24} className="text-blue-500" />;
    return <Sun size={24} className="text-yellow-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Weather Forecast</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {weather?.forecast?.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getWeatherIcon(day.icon)}
                <div>
                  <div className="font-medium">{day.name}</div>
                  <div className="text-sm text-gray-600">{day.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{day.high}°C</div>
                <div className="text-sm text-gray-600">{day.low}°C</div>
              </div>
            </div>
          )) || (
            <div className="text-center p-4 text-gray-500">
              Loading weather data...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
