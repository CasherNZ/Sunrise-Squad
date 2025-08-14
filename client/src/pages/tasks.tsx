import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, Plus, Trash2, Edit, ChevronUp, ChevronDown, User,
  Bed, Utensils, Coffee, Backpack, 
  Shirt, Heart, Music, BookOpen, Book, 
  Droplets, Trophy, Apple, Footprints,
  Home, Calendar, CheckSquare, Sun, Moon,
  Zap, Activity, Smile, Users, Phone, Cog, Pill,
  Brush, UtensilsCrossed, Umbrella, HeartHandshake,
  Glasses, Waves, Car, Scissors,
  ShoppingCart, Gamepad2, Flashlight,
  Clock, Target, Palette, Bath, Ear, Bike, Tractor, Ruler, Laugh,
  Package, Share2, Cookie, MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { avatarOptions, colorOptions } from "@/lib/profile-options";
import type { Child, Task, InsertTask } from "@shared/schema";

// Task templates with icons
const taskTemplates = [
  { title: "Make Bed", icon: "bed", category: "bedroom", points: 5 },
  { title: "Clear Plates", icon: "plates", category: "kitchen", points: 5 },
  { title: "Get Dressed", icon: "shirt", category: "hygiene", points: 5 },
  { title: "Brush Teeth", icon: "laugh", category: "hygiene", points: 5 },
  { title: "Comb Hair", icon: "ruler", category: "hygiene", points: 5 },
  { title: "Wash Hands", icon: "hand-wash", category: "hygiene", points: 5 },
  { title: "Wash Face", icon: "hand-wash", category: "hygiene", points: 5 },
  { title: "Put Shoes by Door", icon: "footprints", category: "tidying", points: 5 },
  { title: "Pack Lunch in Bag", icon: "coffee", category: "school", points: 5 },
  { title: "Pack Homework", icon: "book", category: "school", points: 5 },
  { title: "Bag Ready", icon: "backpack", category: "school", points: 5 },
  { title: "Do Spelling Words", icon: "book-open", category: "learning", points: 10 },
  { title: "Practice Reading", icon: "book-open", category: "learning", points: 10 },
  { title: "Feed Pet", icon: "heart", category: "chores", points: 5 },
  { title: "Put Away Toys", icon: "tractor", category: "tidying", points: 5 },
  { title: "Tidy Desk", icon: "home", category: "tidying", points: 5 },
  { title: "Eat Breakfast", icon: "utensils", category: "meals", points: 5 },
  { title: "Drink Water", icon: "droplets", category: "health", points: 5 },
  { title: "Take Vitamins", icon: "pill", category: "health", points: 5 },
  { title: "Exercise/Stretch", icon: "activity", category: "health", points: 5 },
  { title: "Practice Instrument", icon: "music", category: "learning", points: 5 },
  { title: "Help with Chores", icon: "users", category: "family", points: 5 },
  { title: "Be Kind to Others", icon: "smile", category: "character", points: 10 },
  { title: "Say Please & Thank You", icon: "smile", category: "character", points: 5 },
  { title: "Listen Carefully", icon: "ear", category: "character", points: 5 },
  { title: "Check Weather", icon: "umbrella", category: "preparation", points: 5 },
  { title: "Pack Sports Gear", icon: "trophy", category: "sports", points: 5 },
  { title: "Prepare Snacks", icon: "apple", category: "meals", points: 5 },
  { title: "Organize Room", icon: "home", category: "tidying", points: 5 },
  { title: "Call Family", icon: "phone", category: "family", points: 5 },
  { title: "Clean Glasses", icon: "glasses", category: "hygiene", points: 5 },
  { title: "Check Time", icon: "clock", category: "preparation", points: 5 },
  { title: "Art & Crafts", icon: "palette", category: "creativity", points: 5 },
  { title: "Play Educational Games", icon: "gamepad", category: "learning", points: 5 },
  { title: "Garden Care", icon: "droplets", category: "chores", points: 5 },
  { title: "Bike Safety Check", icon: "bike", category: "transport", points: 5 },
  // New task templates
  { title: "Get Up", icon: "bed", category: "morning", points: 5 },
  { title: "Have Dinner", icon: "utensils", category: "meals", points: 5 },
  { title: "Have Bath", icon: "bath", category: "hygiene", points: 5 },
  { title: "Have Shower", icon: "droplets", category: "hygiene", points: 5 },
  { title: "Put on PJs", icon: "shirt", category: "evening", points: 5 },
  { title: "Say Good Morning", icon: "smile", category: "character", points: 5 },
  { title: "Say Goodnight", icon: "smile", category: "character", points: 5 },
  { title: "Take Medicine", icon: "pill", category: "health", points: 5 },
  { title: "Moisturize", icon: "droplets", category: "hygiene", points: 5 },
  { title: "Put on Sunscreen", icon: "sun", category: "health", points: 5 },
  // Additional requested tasks
  { title: "Put Bag Away", icon: "package", category: "tidying", points: 5 },
  { title: "Put Shoes Away", icon: "footprints", category: "tidying", points: 5 },
  { title: "Empty Lunchbox", icon: "backpack", category: "chores", points: 5 },
  { title: "Say Thank You", icon: "message-circle", category: "character", points: 5 },
  { title: "Share Best Thing", icon: "share", category: "character", points: 5 },
  { title: "Do One Kind Act", icon: "heart", category: "character", points: 10 },
  { title: "Have a Snack", icon: "cookie", category: "meals", points: 5 },
];

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
  cog: Cog,
  pill: Pill,
  teeth: Brush,
  toothbrush: Brush,
  brush: Brush,
  comb: Cog,
  "teddy-bear": HeartHandshake,
  "toy-bear": HeartHandshake,
  plates: UtensilsCrossed,
  "cross-utensils": UtensilsCrossed,
  umbrella: Umbrella,
  glasses: Glasses,
  "hand-wash": Waves,
  wash: Waves,
  car: Car,
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
  bath: Bath,
  shower: Droplets,
  ear: Ear,
  bike: Bike,
  tractor: Tractor,
  ruler: Ruler,
  laugh: Laugh,
  package: Package,
  "put-away": Package,
  bag: Package,
  share: Share2,
  "share-best": Share2,
  cookie: Cookie,
  snack: Cookie,
  "message-circle": MessageCircle,
  "thank-you": MessageCircle,
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TasksPage() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<InsertTask>>({
    title: "",
    icon: "zap",
    points: 5,
    weekdayMask: "1111111", // All days by default
    timeType: "morning", // Default to morning
    order: 0
  });

  const { data: children } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks", selectedUser],
    queryFn: selectedUser 
      ? () => fetch(`/api/tasks/child/${selectedUser}`).then(r => r.json())
      : undefined,
    enabled: !!selectedUser
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsAddDialogOpen(false);
      setNewTask({
        title: "",
        icon: "zap",
        points: 5,
        weekdayMask: "1111111",
        timeType: "morning",
        order: 0
      });
      toast({
        title: "Task added",
        description: "New task has been created successfully.",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTask> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("DELETE", `/api/tasks/${taskId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
      });
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: async ({ childId, taskIds }: { childId: number, taskIds: number[] }) => {
      await apiRequest("PUT", "/api/tasks/reorder", { childId, taskIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/child/${selectedUser}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Tasks reordered",
        description: "Task order has been updated successfully.",
      });
    },
  });

  const handleAddTemplate = (template: typeof taskTemplates[0]) => {
    if (!selectedUser) return;
    
    const taskData = {
      ...newTask,
      childId: selectedUser,
      title: template.title,
      icon: template.icon,
      points: template.points,
      order: (tasks?.length || 0) + 1
    } as InsertTask;
    
    createTaskMutation.mutate(taskData);
  };

  const handleAddCustomTask = () => {
    if (!selectedUser || !newTask.title) return;
    
    const taskData = {
      ...newTask,
      childId: selectedUser,
      order: (tasks?.length || 0) + 1
    } as InsertTask;
    
    createTaskMutation.mutate(taskData);
  };

  const handleWeekdayToggle = (dayIndex: number, isEditing = false) => {
    const currentMask = isEditing ? editingTask?.weekdayMask : newTask.weekdayMask;
    const maskArray = currentMask?.split('') || ['1','1','1','1','1','1','1'];
    maskArray[dayIndex] = maskArray[dayIndex] === '1' ? '0' : '1';
    const newMask = maskArray.join('');
    
    if (isEditing && editingTask) {
      setEditingTask({...editingTask, weekdayMask: newMask});
    } else {
      setNewTask({...newTask, weekdayMask: newMask});
    }
  };

  const moveTask = (taskIndex: number, direction: 'up' | 'down') => {
    if (!tasks || !selectedUser) return;
    
    const sortedTasks = [...tasks];
    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedTasks.length) return;
    
    // Swap tasks
    [sortedTasks[taskIndex], sortedTasks[newIndex]] = [sortedTasks[newIndex], sortedTasks[taskIndex]];
    
    // Create new order array
    const taskIds = sortedTasks.map(task => task.id);
    
    reorderTasksMutation.mutate({ childId: selectedUser, taskIds });
  };

  const selectedUserData = children?.find(c => c.id === selectedUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Tasks</h1>
        </div>

        {/* Child Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {children?.map((child) => {
                const childColor = colorOptions.find(c => c.id === child.colour) || colorOptions[0];
                const childAvatar = avatarOptions.find(a => a.id === child.avatarUrl);
                const AvatarIcon = childAvatar?.icon || User;
                const isSelected = selectedUser === child.id;
                
                return (
                  <Button
                    key={child.id}
                    variant="outline"
                    onClick={() => setSelectedUser(child.id)}
                    className={`h-20 p-4 border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'shadow-lg transform scale-105' 
                        : 'hover:shadow-md hover:scale-102'
                    }`}
                    style={{
                      borderColor: isSelected ? childColor.hex : '#e5e7eb',
                      backgroundColor: isSelected ? childColor.light : 'white'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: isSelected ? childColor.hex : childColor.light,
                          opacity: isSelected ? 1 : 0.8
                        }}
                      >
                        <AvatarIcon 
                          size={24} 
                          style={{ color: isSelected ? 'white' : childColor.hex }} 
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`font-semibold ${
                          isSelected ? 'text-gray-800' : 'text-gray-700'
                        }`}>
                          {child.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{ 
                              backgroundColor: childColor.hex,
                              color: 'white'
                            }}
                          >
                            {child.points || 0} pts
                          </div>
                          <span className="text-xs text-gray-500">{childColor.name}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedUser && (
          <>
            {/* Current Tasks */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Current Tasks for {selectedUserData?.name}</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus size={16} className="mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    
                    {/* Quick Templates */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Quick Add Templates</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {taskTemplates.map((template, index) => {
                          const IconComponent = taskIcons[template.icon as keyof typeof taskIcons] || Zap;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className="h-16 flex flex-col gap-1 text-xs"
                              onClick={() => handleAddTemplate(template)}
                            >
                              <IconComponent size={20} />
                              <span className="text-center">{template.title}</span>
                            </Button>
                          );
                        })}
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Or Create Custom Task</h3>
                        <div className="space-y-4">
                          <div>
                            <Label>Task Name</Label>
                            <Input
                              value={newTask.title || ""}
                              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                              placeholder="Enter task name"
                            />
                          </div>
                          
                          <div>
                            <Label>Icon</Label>
                            <Select value={newTask.icon} onValueChange={(value) => setNewTask({...newTask, icon: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(taskIcons).map(([key, IconComponent]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent size={16} />
                                      <span className="capitalize">{key.replace('-', ' ')}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={newTask.points || 5}
                              onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value)})}
                            />
                          </div>

                          <div>
                            <Label>Time Period</Label>
                            <Select value={newTask.timeType} onValueChange={(value) => setNewTask({...newTask, timeType: value as 'morning' | 'afternoon' | 'evening'})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">
                                  <div className="flex items-center gap-2">
                                    <Sun size={16} />
                                    <span>Morning (12:01 AM - 11:59 AM)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="afternoon">
                                  <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>Afternoon (12:00 PM - 4:59 PM)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="evening">
                                  <div className="flex items-center gap-2">
                                    <Moon size={16} />
                                    <span>Evening (5:00 PM - 12:00 AM)</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Days of Week</Label>
                            <div className="flex gap-2 mt-2">
                              {weekdays.map((day, index) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`day-${index}`}
                                    checked={newTask.weekdayMask?.[index] === '1'}
                                    onCheckedChange={() => handleWeekdayToggle(index)}
                                  />
                                  <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button onClick={handleAddCustomTask} disabled={!newTask.title}>
                            Create Custom Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-6">
                    {/* Morning Tasks Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sun size={20} className="text-amber-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Morning Tasks</h3>
                        <span className="text-sm text-gray-500">
                          ({tasks.filter(t => t.timeType === 'morning').length} tasks)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {tasks.filter(task => task.timeType === 'morning').map((task, index, morningTasks) => {
                          const IconComponent = taskIcons[task.icon as keyof typeof taskIcons] || Zap;
                          const activeDays = task.weekdayMask.split('').map((d, i) => d === '1' ? weekdays[i] : null).filter(Boolean);
                          const globalIndex = tasks.findIndex(t => t.id === task.id);
                          
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <IconComponent size={20} className="text-amber-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{task.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{task.points} points</span>
                                    <span>•</span>
                                    <span>{activeDays.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {/* Priority reordering buttons */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveTask(globalIndex, 'up')}
                                    disabled={index === 0 || reorderTasksMutation.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronUp size={12} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveTask(globalIndex, 'down')}
                                    disabled={index === morningTasks.length - 1 || reorderTasksMutation.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronDown size={12} />
                                  </Button>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingTask(task)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {tasks.filter(t => t.timeType === 'morning').length === 0 && (
                          <p className="text-gray-500 text-center py-4 italic">
                            No morning tasks yet. Add some tasks for the morning routine!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Afternoon Tasks Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock size={20} className="text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Afternoon Tasks</h3>
                        <span className="text-sm text-gray-500">
                          ({tasks.filter(t => t.timeType === 'afternoon').length} tasks)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {tasks.filter(task => task.timeType === 'afternoon').map((task, index, afternoonTasks) => {
                          const IconComponent = taskIcons[task.icon as keyof typeof taskIcons] || Zap;
                          const activeDays = task.weekdayMask.split('').map((d, i) => d === '1' ? weekdays[i] : null).filter(Boolean);
                          const globalIndex = tasks.findIndex(t => t.id === task.id);
                          
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <IconComponent size={20} className="text-orange-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{task.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{task.points} points</span>
                                    <span>•</span>
                                    <span>{activeDays.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {/* Priority reordering buttons */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveTask(globalIndex, 'up')}
                                    disabled={index === 0 || reorderTasksMutation.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronUp size={12} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveTask(globalIndex, 'down')}
                                    disabled={index === afternoonTasks.length - 1 || reorderTasksMutation.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronDown size={12} />
                                  </Button>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingTask(task)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                  disabled={deleteTaskMutation.isPending}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evening Tasks Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Moon size={20} className="text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Evening Tasks</h3>
                        <span className="text-sm text-gray-500">
                          ({tasks.filter(t => t.timeType === 'evening').length} tasks)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {tasks.filter(task => task.timeType === 'evening').map((task, index, eveningTasks) => {
                          const IconComponent = taskIcons[task.icon as keyof typeof taskIcons] || Zap;
                          const activeDays = task.weekdayMask.split('').map((d, i) => d === '1' ? weekdays[i] : null).filter(Boolean);
                          const globalIndex = tasks.findIndex(t => t.id === task.id);
                          
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <IconComponent size={20} className="text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{task.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{task.points} points</span>
                                    <span>•</span>
                                    <span>{activeDays.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {/* Priority reordering buttons */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveTask(globalIndex, 'up')}
                                    disabled={index === 0 || reorderTasksMutation.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronUp size={12} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveTask(globalIndex, 'down')}
                                    disabled={index === eveningTasks.length - 1 || reorderTasksMutation.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronDown size={12} />
                                  </Button>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingTask(task)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {tasks.filter(t => t.timeType === 'evening').length === 0 && (
                          <p className="text-gray-500 text-center py-4 italic">
                            No evening tasks yet. Add some tasks for the evening routine!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No tasks assigned yet. Click "Add Task" to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Edit Task Dialog */}
        {editingTask && (
          <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task Name</Label>
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={editingTask.points || ""}
                    onChange={(e) => setEditingTask({...editingTask, points: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <Label>Time Period</Label>
                  <Select value={editingTask.timeType} onValueChange={(value) => setEditingTask({...editingTask, timeType: value as 'morning' | 'afternoon' | 'evening'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        <div className="flex items-center gap-2">
                          <Sun size={16} />
                          <span>Morning (12:01 AM - 11:59 AM)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="afternoon">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>Afternoon (12:00 PM - 4:59 PM)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="evening">
                        <div className="flex items-center gap-2">
                          <Moon size={16} />
                          <span>Evening (5:00 PM - 12:00 AM)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 mt-2">
                    {weekdays.map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-day-${index}`}
                          checked={editingTask.weekdayMask[index] === '1'}
                          onCheckedChange={() => handleWeekdayToggle(index, true)}
                        />
                        <Label htmlFor={`edit-day-${index}`} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => updateTaskMutation.mutate({ 
                    id: editingTask.id, 
                    data: { 
                      title: editingTask.title, 
                      points: editingTask.points, 
                      weekdayMask: editingTask.weekdayMask,
                      timeType: editingTask.timeType
                    } 
                  })}
                >
                  Update Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}