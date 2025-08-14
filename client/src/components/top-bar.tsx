import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Cloud, CloudRain, Moon, Snowflake, Zap } from "lucide-react";
import { WeatherCharacters } from "@/components/weather-characters";

interface TopBarProps {
  onWeatherClick: () => void;
  onGreetingClick: () => void;
}

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
}

const getWeatherAdvice = (temperature: number, description: string): string => {
  const desc = description.toLowerCase();
  
  if (temperature <= 10) {
    return "Dress warmly today!";
  }
  if (desc.includes('rain') || desc.includes('shower') || desc.includes('drizzle')) {
    return "Take an umbrella!";
  }
  if (desc.includes('snow') || desc.includes('blizzard')) {
    return "Bundle up and stay safe!";
  }
  if (desc.includes('storm') || desc.includes('thunder')) {
    return "Stay indoors if possible!";
  }
  if (temperature >= 25) {
    return "Perfect weather to enjoy!";
  }
  if (desc.includes('wind')) {
    return "It's quite windy out!";
  }
  if (desc.includes('clear') || desc.includes('sunny')) {
    return "Beautiful day ahead!";
  }
  if (desc.includes('cloud')) {
    return "Nice and mild today!";
  }
  
  return "Have a great day!";
};

export default function TopBar({ onWeatherClick, onGreetingClick }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: greeting } = useQuery<{ message: string }>({
    queryKey: ["/api/greeting"],
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 3600000, // Refetch every hour as requested
    staleTime: 3600000, // Consider data fresh for 1 hour
  });

  const { data: timeType } = useQuery<{ timeType: 'morning' | 'afternoon' | 'evening' }>({
    queryKey: ["/api/current-time-type"],
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentDate(now);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (icon: string, isNight: boolean = false) => {
    if (icon.includes('snow')) return <Snowflake size={32} />;
    if (icon.includes('rain') || icon.includes('drizzle')) return <CloudRain size={32} />;
    if (icon.includes('thunder') || icon.includes('storm')) return <Zap size={32} />;
    if (icon.includes('cloud')) return <Cloud size={32} />;
    if (isNight) return <Moon size={32} />;
    return <Sun size={32} />;
  };

  // Determine weather animation class based on weather and time
  const getWeatherClass = () => {
    if (!weather) return 'weather-clear-day';
    
    const desc = weather.description.toLowerCase();
    const temp = weather.temperature;
    const hour = new Date().getHours();
    
    // Determine time period more accurately
    const getTimePeriod = () => {
      if (hour >= 5 && hour < 7) return 'sunrise';    // 5-7am
      if (hour >= 7 && hour < 18) return 'day';       // 7am-6pm  
      if (hour >= 18 && hour < 20) return 'sunset';   // 6-8pm
      return 'night';                                  // 8pm-5am
    };
    
    const timePeriod = getTimePeriod();
    
    if (desc.includes('snow')) return 'weather-snow';
    
    if (desc.includes('rain') || desc.includes('drizzle')) {
      if (timePeriod === 'sunrise') return 'weather-rain-sunrise';
      if (timePeriod === 'sunset') return 'weather-rain-sunset';
      return timePeriod === 'night' ? 'weather-rain-night' : 'weather-rain-day';
    }
    
    if (desc.includes('thunder') || desc.includes('storm')) {
      if (timePeriod === 'sunrise') return 'weather-storm-sunrise';
      if (timePeriod === 'sunset') return 'weather-storm-sunset';
      return timePeriod === 'night' ? 'weather-storm-night' : 'weather-storm-day';
    }
    
    if (desc.includes('cloud') || desc.includes('overcast')) {
      if (timePeriod === 'sunrise') return 'weather-cloudy-sunrise';
      if (timePeriod === 'sunset') return 'weather-cloudy-sunset';
      return timePeriod === 'night' ? 'weather-cloudy-night' : 'weather-cloudy-day';
    }
    
    if (temp >= 25) {
      if (timePeriod === 'sunrise') return 'weather-hot-sunrise';
      if (timePeriod === 'sunset') return 'weather-hot-sunset';
      return timePeriod === 'night' ? 'weather-hot-night' : 'weather-hot-day';
    }
    
    if (temp <= 5) {
      if (timePeriod === 'sunrise') return 'weather-cold-sunrise';
      if (timePeriod === 'sunset') return 'weather-cold-sunset';
      return timePeriod === 'night' ? 'weather-cold-night' : 'weather-cold-day';
    }
    
    // Clear weather with transitional periods
    if (timePeriod === 'sunrise') return 'weather-clear-sunrise';
    if (timePeriod === 'sunset') return 'weather-clear-sunset';
    return timePeriod === 'night' ? 'weather-clear-night' : 'weather-clear-day';
  };

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const dateString = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className={`weather-background ${getWeatherClass()} relative overflow-hidden`}>
      {/* Weather Animation Elements */}
      <div className="weather-elements absolute inset-0 pointer-events-none">
        {/* Dynamic weather particles will be rendered here via CSS */}
      </div>
      
      {/* Clean three-section layout */}
      <div className="relative z-20 px-4 py-6 md:px-6 md:py-8 h-32">
        <div className="grid grid-cols-3 gap-4 items-center max-w-6xl mx-auto h-full">
          {/* Left Third: Weather Characters */}
          <div className="text-left">
            <WeatherCharacters timeType={timeType?.timeType} />
          </div>
          
          {/* Middle Third: Time and Date */}
          <div className="text-center">
            <div className="text-white text-xl md:text-2xl font-bold mb-1" style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.3)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>
              {timeString}
            </div>
            <div className="text-white text-sm md:text-base opacity-90" style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.3)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
            }}>
              {dateString}
            </div>
          </div>
          
          {/* Right Third: Weather */}
          <div className="text-right">
            <button
              onClick={onWeatherClick}
              className="weather-widget bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 md:p-4 text-white inline-flex items-center gap-3 border border-white border-opacity-30 hover:bg-opacity-30 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)'
              }}
            >
              {weather && getWeatherIcon(weather.icon, timeType?.timeType === 'evening')}
              <div className="text-left">
                <div className="font-bold text-sm md:text-base" style={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.3)',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                }}>
                  {weather?.temperature || 22}°C
                </div>
                <div className="text-xs md:text-sm opacity-90 capitalize leading-tight" style={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                }}>
                  {weather?.description || "Sunny"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
