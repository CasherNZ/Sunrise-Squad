import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bed, 
  Utensils, 
  Footprints, 
  Coffee, 
  Backpack, 
  Zap,
  User,
  Shirt,
  Heart,
  Music,
  BookOpen,
  Book,
  Droplets,
  Trophy,
  Apple,
  Home,
  Calendar,
  CheckSquare,
  Sun,
  Activity,
  Smile,
  Users,
  Phone,
  CheckCircle,
  Cog,
  Pill,
  Brush,
  UtensilsCrossed,
  Umbrella,
  HeartHandshake,
  Glasses,
  Waves,
  Car,
  Scissors,
  ShoppingCart,
  Gamepad2,
  Flashlight,
  Clock,
  Target,
  Palette
} from "lucide-react";
import dayjs from "dayjs";
import { avatarOptions, colorOptions, animationOptions } from "@/lib/profile-options";
import type { Child, Task, TaskCompletion } from "@shared/schema";
import { firework, type Theme } from "@/utils/firework";
import PetMenu from "@/components/pet-menu";

interface UserColumnProps {
  child: Child;
  timeType: 'morning' | 'afternoon' | 'evening';
  onTaskComplete: (clickX?: number, clickY?: number) => void;
  isMobile?: boolean;
}

const taskIcons = {
  bed: Bed,
  utensils: Utensils,
  coffee: Coffee,
  backpack: Backpack,
  shirt: Shirt,
  heart: Heart,
  music: Music,
  "book-open": BookOpen,
  book: Book,
  droplets: Droplets,
  trophy: Trophy,
  apple: Apple,
  footprints: Footprints,
  home: Home,
  calendar: Calendar,
  "check-square": CheckSquare,
  sun: Sun,
  zap: Zap,
  activity: Activity,
  smile: Smile,
  users: Users,
  phone: Phone,
  teeth: Brush,
  comb: Cog,
  pill: Pill,
  toothbrush: Brush,
  brush: Brush,
  "teddy-bear": HeartHandshake,
  "toy-bear": HeartHandshake,
  plates: UtensilsCrossed,
  "cross-utensils": UtensilsCrossed,
  umbrella: Umbrella,
  glasses: Glasses,
  "hand-wash": Waves,
  wash: Waves,
  car: Car,
  bike: Car,
  transport: Car,
  scissors: Scissors,
  "shopping-cart": ShoppingCart,
  cart: ShoppingCart,
  gamepad: Gamepad2,
  games: Gamepad2,
  "paint-brush": Palette,
  art: Palette,
  palette: Palette,
  flashlight: Flashlight,
  light: Flashlight,
  clock: Clock,
  time: Clock,
  target: Target,
  goal: Target,
  "shoe-prints": Footprints,
  "toy-brick": Home,
};

export default function UserColumn({ child, timeType, onTaskComplete, isMobile = false }: UserColumnProps) {
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());
  // Use actual current date for proper daily reset functionality
  const today = dayjs().format('YYYY-MM-DD');
  const dayOfWeek = dayjs().day(); // 0 = Sunday, 1 = Monday, etc.

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: [`/api/tasks/child/${child.id}`, { timeType }],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/child/${child.id}?timeType=${timeType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  const { data: completions = [] } = useQuery<TaskCompletion[]>({
    queryKey: [`/api/task-completions/date/${today}`],
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", "/api/task-completions", {
        childId: child.id,
        taskId,
        dateISO: today,
      });
      return response.json();
    },
    onMutate: async (taskId: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      await queryClient.cancelQueries({ queryKey: ["/api/children"] });

      // Snapshot the previous values
      const previousCompletions = queryClient.getQueryData([`/api/task-completions/date/${today}`]);
      const previousChildren = queryClient.getQueryData(["/api/children"]);

      // Optimistically update completions
      queryClient.setQueryData([`/api/task-completions/date/${today}`], (old: any) => {
        const newCompletion = {
          id: Date.now(), // Temporary ID
          childId: child.id,
          taskId,
          dateISO: today,
        };
        return old ? [...old, newCompletion] : [newCompletion];
      });

      // Optimistically update child points
      queryClient.setQueryData(["/api/children"], (old: any) => {
        if (!old) return old;
        return old.map((c: any) => 
          c.id === child.id 
            ? { ...c, points: c.points + (tasks.find(t => t.id === taskId)?.points || 10) }
            : c
        );
      });

      return { previousCompletions, previousChildren };
    },
    onSuccess: () => {
      // Just trigger animation, no data refetch needed
      onTaskComplete();
    },
    onError: (err, taskId, context) => {
      // Revert optimistic updates on error
      if (context?.previousCompletions) {
        queryClient.setQueryData([`/api/task-completions/date/${today}`], context.previousCompletions);
      }
      if (context?.previousChildren) {
        queryClient.setQueryData(["/api/children"], context.previousChildren);
      }
      // Clear completing state on error
      setCompletingTasks(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(taskId);
        return newSet;
      });
    },
    onSettled: () => {
      // Refetch in background to sync with server (no UI impact)
      queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
    },
  });

  const removeCompletionMutation = useMutation({
    mutationFn: async (completionId: number) => {
      const response = await apiRequest("DELETE", `/api/task-completions/${completionId}`);
      return response.json();
    },
    onSuccess: () => {
      // Force immediate refetch of data
      queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/child/${child.id}`] });
    },
  });

  // Get child's color configuration
  const childColor = colorOptions.find(c => c.id === child.colour) || colorOptions[0]; // Default to coral
  const childAvatar = avatarOptions.find(a => a.id === child.avatarUrl);
  const childAnimation = animationOptions.find(a => a.id === child.completionAnimation) || animationOptions[0];

  // Filter tasks for today based on weekday mask and time type
  const todayTasks = tasks.filter(task => {
    const weekdayMask = task.weekdayMask;
    // Convert Sunday = 0 to Monday = 0 indexing
    const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const isScheduledToday = weekdayMask[mondayBasedDay] === '1';
    
    // Filter by time type
    const isCorrectTimeType = task.timeType === timeType;
    
    return isScheduledToday && isCorrectTimeType;
  });

  // Get completed task IDs for this child today
  const completedTaskIds = completions
    .filter(c => c.childId === child.id)
    .map(c => c.taskId);

  const completedTasks = todayTasks.filter(task => completedTaskIds.includes(task.id));
  
  // Filter out tasks currently being completed from pending tasks for smooth animation
  const pendingTasks = todayTasks.filter(task => 
    !completedTaskIds.includes(task.id) && !completingTasks.has(task.id)
  );
  


  const handleTaskClick = (task: Task, event: React.MouseEvent) => {
    const completion = completions.find(c => c.childId === child.id && c.taskId === task.id);
    
    if (completion) {
      // Task is completed, remove completion
      removeCompletionMutation.mutate(completion.id);
    } else {
      // Don't allow double-clicking
      if (completingTasks.has(task.id)) {
        return;
      }
      
      // Get checkbox element for precise firework anchor point
      const taskCard = event.currentTarget as HTMLElement;
      const checkbox = taskCard.querySelector('.task-checkbox') as HTMLElement;
      
      if (checkbox) {
        // 1. Firework burst from checkbox center
        firework(checkbox, child.completionAnimation as Theme);
        
        // 2. Mark task as removing for slide-up animation
        setCompletingTasks(prev => new Set(Array.from(prev).concat(task.id)));
        
        // 3. Complete the task with optimistic updates (immediate points and completion)
        completeTaskMutation.mutate(task.id);
      }
    }
  };

  // Limit displayed tasks based on screen size
  const maxVisibleTasks = isMobile ? 5 : 8;
  const visiblePendingTasks = pendingTasks.slice(0, maxVisibleTasks);
  const hiddenTasksCount = pendingTasks.length - maxVisibleTasks;

  return (
    <div className="child-column flex flex-col">
      {/* Child header */}
      <Card 
        className="child-card shadow-lg p-4 mb-4 border-2 bg-white flex-shrink-0"
        style={{ borderColor: childColor.hex }}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: childColor.light }}
              >
                {childAvatar ? (
                  (() => {
                    const AvatarIcon = childAvatar.icon;
                    return <AvatarIcon size={28} style={{ color: childColor.hex }} />;
                  })()
                ) : (
                  <User 
                    size={28} 
                    style={{ color: childColor.hex }} 
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{child.name}</h3>
                <div className="text-sm text-gray-600">
                  {completedTasks.length} of {todayTasks.length} tasks done
                </div>
              </div>
            </div>
            
            {/* Points Scorecard */}
            <div 
              className="points-scorecard flex flex-col items-center justify-center px-4 py-2 rounded-xl min-w-[80px]"
              style={{ backgroundColor: childColor.hex }}
            >
              <div className="text-white font-bold text-2xl leading-none">
                {child.points || 0}
              </div>
              <div className="text-white text-xs font-medium opacity-90 mt-1">
                POINTS
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task List - Limited visible tasks */}
      <div className="task-list space-y-3 flex-1">
        {visiblePendingTasks.map((task, index) => {
          const IconComponent = taskIcons[task.icon as keyof typeof taskIcons] || Zap;
          const isCompleting = completingTasks.has(task.id);
          
          return (
            <Card
              key={task.id}
              className={`task-card shadow-md cursor-pointer border-2 bg-white hover:bg-gray-50 ${
                isCompleting ? 'task-completing removing' : ''
              }`}
              style={{ 
                borderColor: isCompleting ? '#10b981' : childColor.hex,
                backgroundColor: isCompleting ? '#dcfce7' : 'white'
              }}
              onClick={(e) => handleTaskClick(task, e)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: isCompleting ? '#bbf7d0' : childColor.light 
                  }}
                >
                  <IconComponent 
                    className={isCompleting ? 'text-green-700' : ''} 
                    style={{ color: isCompleting ? '#15803d' : childColor.hex }}
                    size={18} 
                  />
                </div>
                <span className={`flex-1 text-sm font-medium ${
                  isCompleting ? 'text-green-700' : 'text-gray-800'
                }`}>
                  {task.title}
                </span>
                <div 
                  className={`task-checkbox w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors duration-200 ${
                    isCompleting 
                      ? 'bg-green-500 border-green-500' 
                      : 'hover:opacity-75'
                  }`}
                  style={{ 
                    borderColor: isCompleting ? '#10b981' : childColor.hex,
                    backgroundColor: isCompleting ? '#10b981' : 'transparent'
                  }}
                >
                  {isCompleting ? (
                    <CheckCircle className="text-white" size={16} />
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Show hidden tasks indicator */}
        {hiddenTasksCount > 0 && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">
              +{hiddenTasksCount} more task{hiddenTasksCount > 1 ? 's' : ''}
            </p>
          </div>
        )}
        
        {/* Show completion message when all tasks are done */}
        {pendingTasks.length === 0 && todayTasks.length > 0 && (
          <PetMenu childId={child.id} />
        )}
        
        {/* Show message when no tasks are assigned */}
        {todayTasks.length === 0 && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm text-gray-600">No tasks for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
