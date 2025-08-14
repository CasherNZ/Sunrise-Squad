import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import TopBar from "@/components/top-bar";
import UserColumn from "@/components/child-column";
import { EmojiCascade } from "@/components/emoji-cascade";
import { NewsTicker } from "@/components/news-ticker";
import WeatherModal from "@/components/weather-modal";
import GreetingSettingsModal from "@/components/greeting-settings-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Gift, Settings, Sun, Moon } from "lucide-react";
import type { Child, Prize, Task, TaskCompletion } from "@shared/schema";
import { Theme } from "@/utils/firework";
import dayjs from "dayjs";

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

// Session storage key for tracking triggered cascades
const SESSION_KEY = 'morning-routine-triggered-cascades';

// Get triggered children from session storage
const getSessionTriggeredChildren = (): Set<number> => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const today = dayjs().format('YYYY-MM-DD'); // Use actual current date
      if (data.date === today) {
        console.log('Loading triggered children from session:', data.children);
        return new Set(data.children || []);
      }
    }
  } catch (error) {
    console.error('Error reading session storage:', error);
  }
  console.log('No triggered children found in session storage');
  return new Set();
};

// Save triggered children to session storage
const saveSessionTriggeredChildren = (children: Set<number>) => {
  try {
    const today = dayjs().format('YYYY-MM-DD'); // Use actual current date
    const childrenArray = Array.from(children);
    console.log('Saving triggered children to session:', childrenArray);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      date: today,
      children: childrenArray
    }));
  } catch (error) {
    console.error('Error writing to session storage:', error);
  }
};

export default function Home() {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [cascadeState, setCascadeState] = useState<{
    isActive: boolean;
    theme: Theme;
    childId: number | null;
    triggeredChildren: Set<number>;
    skipDetection: boolean;
  }>({
    isActive: false,
    theme: 'confetti',
    childId: null,
    triggeredChildren: new Set(),
    skipDetection: false
  });


  // Get current time type (morning/afternoon/evening)
  const { data: currentTimeData } = useQuery<{ timeType: 'morning' | 'afternoon' | 'evening' }>({
    queryKey: ["/api/current-time-type"],
    refetchInterval: 60000, // Refetch every minute
  });

  const currentTimeType = currentTimeData?.timeType || 'morning';

  // Get weather data for background theming
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 3600000, // Refetch every hour
    staleTime: 3600000, // Consider data fresh for 1 hour
  });

  // Get subtle weather-based background gradient
  const getWeatherBackground = () => {
    if (!weather) return 'from-blue-50 to-orange-50'; // Default gradient
    
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
      return 'from-slate-100 to-blue-50';
    }
    
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return 'from-slate-200 to-gray-100';
    }
    
    if (desc.includes('thunder') || desc.includes('storm')) {
      return 'from-gray-200 to-slate-200';
    }
    
    if (desc.includes('cloud') || desc.includes('overcast')) {
      return 'from-gray-100 to-slate-100';
    }
    
    if (temp >= 25) {
      return 'from-orange-100 to-red-50';
    }
    
    if (temp <= 5) {
      return 'from-blue-100 to-indigo-50';
    }
    
    // Clear weather - varies by time
    if (timePeriod === 'sunrise') {
      return 'from-yellow-100 to-orange-100';
    }
    
    if (timePeriod === 'sunset') {
      return 'from-orange-100 to-purple-100';
    }
    
    if (timePeriod === 'night') {
      return 'from-indigo-100 to-purple-100';
    }
    
    // Default clear day
    return 'from-blue-50 to-cyan-50';
  };

  // Initialize cascade state with session data on mount
  useEffect(() => {
    const sessionTriggered = getSessionTriggeredChildren();
    if (sessionTriggered.size > 0) {
      setCascadeState(prev => ({
        ...prev,
        triggeredChildren: sessionTriggered
      }));
    }
  }, []); // Run once on mount

  const { data: childrenData = [], isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  // Sort children by ID to ensure consistent column positions
  const children = [...childrenData].sort((a, b) => a.id - b.id);

  const { data: prizes = [] } = useQuery<Prize[]>({
    queryKey: ["/api/prizes"],
  });

  // Get task completions for today (using actual current date)
  const today = dayjs().format('YYYY-MM-DD');
  const { data: completions = [] } = useQuery<TaskCompletion[]>({
    queryKey: [`/api/task-completions/date/${today}`],
  });

  // Check if any child has completed all their tasks for the current period
  useEffect(() => {
    if (!children.length || !completions.length || cascadeState.isActive || cascadeState.skipDetection) {
      if (cascadeState.skipDetection) {
        console.log('Skipping cascade check - detection disabled during data load');
      }
      return;
    }

    const checkTaskCompletion = async () => {
      for (const child of children) {
        // Skip if already triggered for this child
        if (cascadeState.triggeredChildren.has(child.id)) {
          console.log(`Skipping cascade for ${child.name} - already triggered in this session`);
          continue;
        }

        // Get tasks for this child
        const tasks = await queryClient.ensureQueryData<Task[]>({
          queryKey: [`/api/tasks/child/${child.id}`],
        });

        // Filter tasks for current time period (using actual current day)
        const todayTasks = tasks.filter(task => {
          const dayOfWeek = dayjs().day(); // Get actual current day (0 = Sunday, 6 = Saturday)
          const isScheduledToday = task.weekdayMask && task.weekdayMask[dayOfWeek] === '1';
          const isCorrectTimeType = task.timeType === currentTimeType;
          return isScheduledToday && isCorrectTimeType;
        });

        // Get completed task IDs for this child today
        const completedTaskIds = completions
          .filter(c => c.childId === child.id)
          .map(c => c.taskId);

        // Check if all tasks are completed
        const allTasksCompleted = todayTasks.length > 0 && 
          todayTasks.every(task => completedTaskIds.includes(task.id));

        console.log(`Child ${child.name}:`, {
          todayTasks: todayTasks.length,
          completedTasks: completedTaskIds.length,
          allCompleted: allTasksCompleted,
          theme: child.completionAnimation
        });

        // Trigger cascade if all tasks completed 
        if (allTasksCompleted) {
          console.log(`Triggering cascade for ${child.name} with theme:`, child.completionAnimation);
          console.log('Task completion status:', { todayTasks: todayTasks.length, completedTasks: completedTaskIds.length });
          const newTriggeredChildren = new Set(cascadeState.triggeredChildren);
          newTriggeredChildren.add(child.id);
          
          // Save to session storage
          saveSessionTriggeredChildren(newTriggeredChildren);
          
          setCascadeState({
            isActive: true,
            theme: (child.completionAnimation as Theme) || 'confetti',
            childId: child.id,
            triggeredChildren: newTriggeredChildren,
            skipDetection: false
          });
          break; // Only trigger for first child who completes all tasks
        }
      }
    };

    checkTaskCompletion();
  }, [children, completions, currentTimeType, cascadeState.isActive, cascadeState.triggeredChildren, cascadeState.skipDetection, queryClient]);

  const handleTaskComplete = (clickX?: number, clickY?: number) => {
    // Placeholder - actual animation is handled in UserColumn now
  };

  const handleCascadeComplete = () => {
    console.log('Cascade completed, deactivating...');
    // Add a small delay to ensure clean transition
    setTimeout(() => {
      setCascadeState(prev => ({
        isActive: false,
        theme: 'confetti',
        childId: null,
        triggeredChildren: prev.triggeredChildren, // Keep track of already triggered children
        skipDetection: false
      }));
    }, 100);
  };

  if (childrenLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getWeatherBackground()} font-sans`}>
      <TopBar
        onWeatherClick={() => setShowWeatherModal(true)}
        onGreetingClick={() => setShowGreetingModal(true)}
      />
      
      {/* News Ticker Banner */}
      <NewsTicker timeType={currentTimeType} />

      <div className="px-4 py-6 md:px-8 max-w-7xl mx-auto">

        {/* Users Grid - Improved spacing with better alignment */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'} mb-6 items-start`}>
          {children.map((child) => (
            <UserColumn
              key={child.id}
              child={child}
              timeType={currentTimeType}
              onTaskComplete={handleTaskComplete}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Prizes Section - Moved closer */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Rewards</h2>
              <Link href="/prizes">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prizes.slice(0, 3).map((prize, index) => {
                const gradients = [
                  "from-purple-400 to-pink-400",
                  "from-green-400 to-blue-400",
                  "from-orange-400 to-red-400"
                ];
                const icons = [Gift, Settings, Gift];
                const Icon = icons[index % icons.length];
                
                return (
                  <Link 
                    key={prize.id}
                    href="/prizes"
                    className={`prize-card bg-gradient-to-r ${gradients[index % gradients.length]} rounded-xl p-4 text-white hover:scale-105 transition-transform duration-200 cursor-pointer block`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="font-semibold">{prize.title}</div>
                        <div className="text-sm opacity-90">{prize.targetPoints} points</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full" 
                          style={{ width: `${Math.min(100, Math.random() * 100)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings FAB */}
      <div className="fixed bottom-6 right-6">
        <Link href="/settings">
          <Button 
            size="lg" 
            className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all hover:scale-105"
          >
            <Settings size={20} />
          </Button>
        </Link>
      </div>

      {/* Modals */}
      <WeatherModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
      />
      
      <GreetingSettingsModal
        isOpen={showGreetingModal}
        onClose={() => setShowGreetingModal(false)}
        customMorningMessage=""
        customAfternoonMessage=""
        customEveningMessage=""
        onSave={() => {}}
        isPending={false}
      />

      {/* Emoji Cascade */}
      <EmojiCascade
        theme={cascadeState.theme}
        isActive={cascadeState.isActive}
        onComplete={handleCascadeComplete}
      />
    </div>
  );
}
