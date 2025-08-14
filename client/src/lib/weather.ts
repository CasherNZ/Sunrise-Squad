export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  name: string;
  high: number;
  low: number;
  description: string;
  icon: string;
}

export const getWeatherIcon = (icon: string): string => {
  const iconMap: Record<string, string> = {
    "01d": "sun",
    "01n": "moon",
    "02d": "cloud-sun",
    "02n": "cloud-moon",
    "03d": "cloud",
    "03n": "cloud",
    "04d": "cloud",
    "04n": "cloud",
    "09d": "cloud-rain",
    "09n": "cloud-rain",
    "10d": "cloud-rain",
    "10n": "cloud-rain",
    "11d": "cloud-lightning",
    "11n": "cloud-lightning",
    "13d": "cloud-snow",
    "13n": "cloud-snow",
    "50d": "wind",
    "50n": "wind",
  };

  return iconMap[icon] || "sun";
};
