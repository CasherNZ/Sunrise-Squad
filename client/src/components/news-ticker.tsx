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

interface NewsTickerProps {
  timeType?: 'morning' | 'afternoon' | 'evening';
}

export function NewsTicker({ timeType }: NewsTickerProps) {
  const { data: greeting } = useQuery<{ message: string }>({
    queryKey: ['/api/greeting'],
  });

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 3600000, // Refetch every hour
    staleTime: 3600000, // Consider data fresh for 1 hour
  });

  const newsLabel = timeType === 'evening' ? 'Evening News' : 
                   timeType === 'afternoon' ? 'Afternoon News' : 'Morning News';
  const customMessage = greeting?.message || 'Good Morning!';

  // Get weather-based color theme
  const getWeatherColors = () => {
    if (!weather) return {
      background: 'from-blue-900/50 to-indigo-900/50',
      border: 'border-blue-200',
      labelBg: 'from-blue-400 to-indigo-400',
      labelText: 'text-blue-900',
      textColor: 'text-blue-100'
    };
    
    const desc = weather.description.toLowerCase();
    const temp = weather.temperature;
    const hour = new Date().getHours();
    
    // Determine time period
    const getTimePeriod = () => {
      if (hour >= 5 && hour < 7) return 'sunrise';
      if (hour >= 7 && hour < 18) return 'day';
      if (hour >= 18 && hour < 20) return 'sunset';
      return 'night';
    };
    
    const timePeriod = getTimePeriod();
    
    if (desc.includes('snow')) {
      return {
        background: 'from-slate-300/50 to-blue-100/50',
        border: 'border-slate-200',
        labelBg: 'from-slate-200 to-blue-200',
        labelText: 'text-slate-800',
        textColor: 'text-slate-800'
      };
    }
    
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return {
        background: 'from-slate-600/50 to-slate-800/50',
        border: 'border-slate-400',
        labelBg: 'from-slate-400 to-slate-500',
        labelText: 'text-slate-100',
        textColor: 'text-slate-100'
      };
    }
    
    if (desc.includes('thunder') || desc.includes('storm')) {
      return {
        background: 'from-gray-800/50 to-black/50',
        border: 'border-yellow-400',
        labelBg: 'from-yellow-400 to-yellow-500',
        labelText: 'text-gray-900',
        textColor: 'text-yellow-100'
      };
    }
    
    if (desc.includes('cloud') || desc.includes('overcast')) {
      return {
        background: 'from-gray-400/50 to-gray-600/50',
        border: 'border-gray-300',
        labelBg: 'from-gray-300 to-gray-400',
        labelText: 'text-gray-800',
        textColor: 'text-gray-100'
      };
    }
    
    if (temp >= 25) {
      return {
        background: 'from-orange-700/50 to-red-700/50',
        border: 'border-orange-300',
        labelBg: 'from-orange-400 to-red-400',
        labelText: 'text-red-900',
        textColor: 'text-orange-100'
      };
    }
    
    if (temp <= 5) {
      return {
        background: 'from-blue-700/50 to-indigo-800/50',
        border: 'border-blue-300',
        labelBg: 'from-blue-300 to-indigo-300',
        labelText: 'text-blue-900',
        textColor: 'text-blue-100'
      };
    }
    
    // Clear weather - varies by time
    if (timePeriod === 'sunrise') {
      return {
        background: 'from-yellow-600/50 to-orange-600/50',
        border: 'border-yellow-300',
        labelBg: 'from-yellow-300 to-orange-300',
        labelText: 'text-orange-900',
        textColor: 'text-yellow-100'
      };
    }
    
    if (timePeriod === 'sunset') {
      return {
        background: 'from-orange-600/50 to-purple-600/50',
        border: 'border-orange-300',
        labelBg: 'from-orange-300 to-purple-300',
        labelText: 'text-purple-900',
        textColor: 'text-orange-100'
      };
    }
    
    if (timePeriod === 'night') {
      return {
        background: 'from-indigo-900/50 to-purple-900/50',
        border: 'border-indigo-300',
        labelBg: 'from-indigo-300 to-purple-300',
        labelText: 'text-indigo-900',
        textColor: 'text-indigo-100'
      };
    }
    
    // Default clear day
    return {
      background: 'from-blue-500/50 to-cyan-500/50',
      border: 'border-cyan-300',
      labelBg: 'from-cyan-300 to-blue-300',
      labelText: 'text-blue-900',
      textColor: 'text-cyan-100'
    };
  };

  const colors = getWeatherColors();

  return (
    <div className={`relative bg-gradient-to-r ${colors.background} backdrop-blur-sm border-t ${colors.border} border-opacity-30 overflow-hidden`}>
      {/* Subtle 3D depth effects matching info bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
      
      {/* Ticker content container */}
      <div className="relative z-10 flex items-center h-12">
        {/* Fixed "Breaking News" style element */}
        <div className={`flex-shrink-0 bg-gradient-to-r ${colors.labelBg} ${colors.labelText} px-4 py-2 font-bold text-sm uppercase tracking-wider`}
             style={{ 
               textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.3)',
               boxShadow: '2px 0 4px rgba(0,0,0,0.2)'
             }}>
          {newsLabel}
        </div>
        
        {/* Scrolling message area */}
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap animate-scroll">
            <span 
              className={`${colors.textColor} font-medium text-base inline-block pl-4`}
              style={{ 
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
              }}
            >
              {/* Repeat the custom message for continuous scroll */}
              {Array(8).fill(`${customMessage} • `).join('')}
            </span>
          </div>
        </div>
      </div>
      
      {/* Subtle gradient fade on right edge only */}
      <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l ${colors.background} to-transparent z-20 pointer-events-none`} />
    </div>
  );
}