import { useQuery } from "@tanstack/react-query";
import nightImage from "@assets/Night_1753681857589.png";
import coldDayImage from "@assets/Cold Day_1753681857590.png";
import hotDayImage from "@assets/Hot Day_1753681857591.png";
import sunnyDayImage from "@assets/Sunny Day_1753681857592.png";
import cloudyDayImage from "@assets/Cloudy Day_1753681857593.png";
import rainyDayImage from "@assets/Rainy Day_1753681857594.png";

interface WeatherCharactersProps {
  timeType?: 'morning' | 'afternoon' | 'evening';
}

interface WeatherData {
  icon: string;
  description: string;
  temperature: number;
}

export function WeatherCharacters({ timeType }: WeatherCharactersProps) {
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ['/api/weather'],
  });

  // Determine character image based on weather and time
  const getCharacterImage = (weatherIcon: string, description: string, temperature: number, currentTimeType: string) => {
    const desc = description?.toLowerCase() || '';
    
    // Only show pajamas for actual nighttime (after 8 PM or during evening period after 8 PM)
    const now = new Date();
    const currentHour = now.getHours();
    const isActualNight = currentHour >= 20 || currentHour < 6; // 8 PM to 6 AM
    
    if (isActualNight) {
      return nightImage;
    }
    
    // Weather-based during day
    if (weatherIcon?.includes('rain') || weatherIcon?.includes('drizzle') || desc.includes('rain')) {
      return rainyDayImage;
    } else if (weatherIcon?.includes('snow') || desc.includes('snow')) {
      return coldDayImage;
    } else if (weatherIcon?.includes('cloud') || desc.includes('cloud')) {
      return cloudyDayImage;
    } else if (temperature >= 25) {
      return hotDayImage;
    } else if (weatherIcon?.includes('clear') || weatherIcon?.includes('sun') || desc.includes('clear')) {
      return sunnyDayImage;
    }
    
    return cloudyDayImage; // default
  };

  const characterImage = getCharacterImage(
    weather?.icon || '', 
    weather?.description || '', 
    weather?.temperature || 15, 
    timeType || 'morning'
  );

  return (
    <div className="flex items-center justify-center h-full overflow-hidden">
      <img 
        src={characterImage}
        alt="Weather characters"
        className="h-24 w-auto drop-shadow-md object-contain"
        style={{
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
        }}
      />
    </div>
  );
}