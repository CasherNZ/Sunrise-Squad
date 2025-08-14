import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import dayjs from "dayjs";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Users, Calendar, Gift, Cloud, Plus, Edit, Trash2, User, LogOut, Sun, Moon, Clock, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChildProfileModal } from "@/components/child-profile-modal";
import { WeatherSettingsModal } from "@/components/weather-settings-modal";
import { UsersModal } from "@/components/users-modal";
import { GreetingSettingsModal } from "@/components/greeting-settings-modal";
import { CutoffSettingsModal } from "@/components/cutoff-settings-modal";
import { PinEntryModal } from "@/components/pin-entry-modal";
import { avatarOptions, colorOptions, animationOptions } from "@/lib/profile-options";
import { clearAllDataCache, refreshAllDataQueries } from "@/lib/cache-utils";
import { useAuth } from "@/hooks/useAuth";
import type { Settings, Child } from "@shared/schema";

// Session storage key for tracking triggered cascades (matching home.tsx)
const SESSION_KEY = 'morning-routine-triggered-cascades';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherUnits, setWeatherUnits] = useState("metric");
  const [ageWeightedPoints, setAgeWeightedPoints] = useState(false);
  const [pointsDeactivateHour, setPointsDeactivateHour] = useState(8);
  const [enablePointsCutoff, setEnablePointsCutoff] = useState(false);
  const [enableMorningCutoff, setEnableMorningCutoff] = useState(false);
  const [enableAfternoonCutoff, setEnableAfternoonCutoff] = useState(false);
  const [enableEveningCutoff, setEnableEveningCutoff] = useState(false);
  const [morningCutoffHour, setMorningCutoffHour] = useState(8);
  const [morningCutoffMinute, setMorningCutoffMinute] = useState(0);
  const [afternoonCutoffHour, setAfternoonCutoffHour] = useState(15);
  const [afternoonCutoffMinute, setAfternoonCutoffMinute] = useState(0);
  const [eveningCutoffHour, setEveningCutoffHour] = useState(20);
  const [eveningCutoffMinute, setEveningCutoffMinute] = useState(0);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | undefined>();
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [customMorningMessage, setCustomMorningMessage] = useState("");
  const [customAfternoonMessage, setCustomAfternoonMessage] = useState("");
  const [customEveningMessage, setCustomEveningMessage] = useState("");
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [greetingModalOpen, setGreetingModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [cutoffModalOpen, setCutoffModalOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);  
  const [pointsToAllocate, setPointsToAllocate] = useState<number>(10);


  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Handle data refresh to resolve display issues
  const handleDataRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Clearing cache and updating display...",
    });
    
    // Clear all cached data and force fresh fetch
    clearAllDataCache();
    refreshAllDataQueries();
    
    // Also trigger window reload as a fallback
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Update local state when settings data changes
  useEffect(() => {
    if (settings) {
      setWeatherCity(settings.weatherCity || "");
      setWeatherUnits(settings.weatherUnits || "metric");
      setAgeWeightedPoints(settings.ageWeightedPoints || false);
      setPointsDeactivateHour(settings.pointsDeactivateHour || 8);
      setEnablePointsCutoff(settings.enablePointsCutoff || false);
      setEnableMorningCutoff(settings.enableMorningCutoff || false);
      setEnableAfternoonCutoff(settings.enableAfternoonCutoff || false);
      setEnableEveningCutoff(settings.enableEveningCutoff || false);
      setMorningCutoffHour(settings.morningCutoffHour || 8);
      setMorningCutoffMinute(settings.morningCutoffMinute || 0);
      setAfternoonCutoffHour(settings.afternoonCutoffHour || 15);
      setAfternoonCutoffMinute(settings.afternoonCutoffMinute || 0);
      setEveningCutoffHour(settings.eveningCutoffHour || 20);
      setEveningCutoffMinute(settings.eveningCutoffMinute || 0);
      setUseCustomMessage(settings.useCustomMessage || false);
      setCustomMessage(settings.customMessage || "");
      setCustomMorningMessage(settings.customMorningMessage || "");
      setCustomAfternoonMessage(settings.customAfternoonMessage || "");
      setCustomEveningMessage(settings.customEveningMessage || "");
    }
  }, [settings]);

  // Check PIN protection only on initial page load
  useEffect(() => {
    if (settings?.enableSettingsPin && !isPinVerified) {
      setPinModalOpen(true);
    }
  }, [settings?.enableSettingsPin]); // Only run when PIN setting changes, not isPinVerified

  const handlePinSuccess = () => {
    setIsPinVerified(true);
    setPinModalOpen(false);
  };

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      queryClient.invalidateQueries({ queryKey: ["/api/greeting"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
  });

  const resetMorningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset/morning");
      return response.json();
    },
    onSuccess: (data) => {
      // Clear all relevant caches with proper invalidation
      // Use current date for proper daily reset functionality
      const today = dayjs().format('YYYY-MM-DD');
      queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points-history"] });
      
      // Force refetch for all task lists
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString()?.startsWith('/api/tasks/child/') || false
      });
      
      // Clear cascade session storage so animations can trigger again
      try {
        sessionStorage.removeItem(SESSION_KEY);
        console.log('Cleared cascade session storage after morning reset');
      } catch (error) {
        console.error('Error clearing session storage:', error);
      }
      
      toast({
        title: "Morning tasks reset",
        description: `Cleared ${data.clearedCount} morning task completions and subtracted ${data.pointsSubtracted} points.`,
      });
    },
  });

  const resetAfternoonMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset/afternoon");
      return response.json();
    },
    onSuccess: (data) => {
      // Clear all relevant caches with proper invalidation
      // Use current date for proper daily reset functionality
      const today = dayjs().format('YYYY-MM-DD');
      queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points-history"] });
      
      // Force refetch for all task lists
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString()?.startsWith('/api/tasks/child/') || false
      });
      
      // Clear cascade session storage so animations can trigger again
      try {
        sessionStorage.removeItem(SESSION_KEY);
        console.log('Cleared cascade session storage after afternoon reset');
      } catch (error) {
        console.error('Error clearing session storage:', error);
      }
      
      toast({
        title: "Afternoon tasks reset",
        description: `Cleared ${data.clearedCount} afternoon task completions and subtracted ${data.pointsSubtracted} points.`,
      });
    },
  });

  const resetEveningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset/evening");
      return response.json();
    },
    onSuccess: (data) => {
      // Clear all relevant caches with proper invalidation
      // Use current date for proper daily reset functionality
      const today = dayjs().format('YYYY-MM-DD');
      queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points-history"] });
      
      // Force refetch for all task lists
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString()?.startsWith('/api/tasks/child/') || false
      });
      
      // Clear cascade session storage so animations can trigger again
      try {
        sessionStorage.removeItem(SESSION_KEY);
        console.log('Cleared cascade session storage after evening reset');
      } catch (error) {
        console.error('Error clearing session storage:', error);
      }
      
      toast({
        title: "Evening tasks reset",
        description: `Cleared ${data.clearedCount} evening task completions and subtracted ${data.pointsSubtracted} points.`,
      });
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset");
      return response.json();
    },
    onSuccess: (data) => {
      // Clear all relevant caches with proper invalidation
      // Use current date for proper daily reset functionality
      const today = dayjs().format('YYYY-MM-DD');
      queryClient.invalidateQueries({ queryKey: [`/api/task-completions/date/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points-history"] });
      
      // Force refetch for all task lists
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString()?.startsWith('/api/tasks/child/') || false
      });
      
      // Clear cascade session storage so animations can trigger again
      try {
        sessionStorage.removeItem(SESSION_KEY);
        console.log('Cleared cascade session storage after all tasks reset');
      } catch (error) {
        console.error('Error clearing session storage:', error);
      }
      
      toast({
        title: "All tasks reset",
        description: `Cleared ${data.clearedCount} task completions and subtracted ${data.pointsSubtracted} points.`,
      });
    },
  });

  const handleWeatherUpdate = () => {
    updateSettingsMutation.mutate({
      weatherCity: weatherCity.trim(),
      weatherUnits,
    });
    
    // Force weather data refresh after settings update
    queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
  };

  const handleMessageUpdate = () => {
    updateSettingsMutation.mutate({
      useCustomMessage,
      customMessage: useCustomMessage ? customMessage : undefined,
    });
    
    // Force greeting data refresh after settings update
    queryClient.invalidateQueries({ queryKey: ["/api/greeting"] });
  };

  const handlePointsToggle = (enabled: boolean) => {
    setAgeWeightedPoints(enabled);
    updateSettingsMutation.mutate({
      ageWeightedPoints: enabled,
    });
  };

  const handlePointsDeactivateHourUpdate = () => {
    updateSettingsMutation.mutate({
      pointsDeactivateHour: pointsDeactivateHour,
    });
  };

  const handlePointsCutoffToggle = (enabled: boolean) => {
    setEnablePointsCutoff(enabled);
    updateSettingsMutation.mutate({
      enablePointsCutoff: enabled,
    });
  };

  const handleCutoffSave = (cutoffSettings: {
    enableMorningCutoff: boolean;
    enableAfternoonCutoff: boolean;
    enableEveningCutoff: boolean;
    morningCutoffHour: number;
    morningCutoffMinute: number;
    afternoonCutoffHour: number;
    afternoonCutoffMinute: number;
    eveningCutoffHour: number;
    eveningCutoffMinute: number;
  }) => {
    // Update local state
    setEnableMorningCutoff(cutoffSettings.enableMorningCutoff);
    setEnableAfternoonCutoff(cutoffSettings.enableAfternoonCutoff);
    setEnableEveningCutoff(cutoffSettings.enableEveningCutoff);
    setMorningCutoffHour(cutoffSettings.morningCutoffHour);
    setMorningCutoffMinute(cutoffSettings.morningCutoffMinute);
    setAfternoonCutoffHour(cutoffSettings.afternoonCutoffHour);
    setAfternoonCutoffMinute(cutoffSettings.afternoonCutoffMinute);
    setEveningCutoffHour(cutoffSettings.eveningCutoffHour);
    setEveningCutoffMinute(cutoffSettings.eveningCutoffMinute);
    
    // Save to database
    updateSettingsMutation.mutate(cutoffSettings);
  };

  const handleCreateChild = () => {
    setEditingChild(undefined);
    setModalMode("create");
    setChildModalOpen(true);
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setModalMode("edit");
    setChildModalOpen(true);
  };

  const deleteChildMutation = useMutation({
    mutationFn: async (childId: number) => {
      const response = await apiRequest("DELETE", `/api/children/${childId}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      
      // Invalidate all task-related queries that might reference this child
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0]?.toString();
          return key?.startsWith('/api/tasks/child/') || 
                 key?.startsWith('/api/task-completions/') ||
                 key?.startsWith('/api/points-history/') || false;
        }
      });
      
      // Force refetch children data immediately
      queryClient.refetchQueries({ queryKey: ["/api/children"] });
      
      toast({
        title: "Profile deleted",
        description: "Child profile has been deleted successfully.",
      });
    },
  });

  const allocatePointsMutation = useMutation({
    mutationFn: async ({ childId, points }: { childId: number; points: number }) => {
      const response = await apiRequest("POST", "/api/allocate-points", {
        childId,
        points,
        reason: "Manual allocation", // Default reason
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate children data to update points display
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      
      // Reset form
      setPointsModalOpen(false);
      setSelectedChildId(null);
      setPointsToAllocate(10);
      
      toast({
        title: "Points allocated successfully",
        description: `Added ${data.pointsAdded} points to ${children.find(c => c.id === data.child.id)?.name || 'child'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error allocating points",
        description: error.message || "Failed to allocate points. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAllocatePoints = () => {
    if (!selectedChildId || pointsToAllocate <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a child and enter a positive number of points.",
        variant: "destructive",
      });
      return;
    }

    allocatePointsMutation.mutate({
      childId: selectedChildId,
      points: pointsToAllocate,
    });
  };

  const handleResetMorning = () => {
    resetMorningMutation.mutate();
  };

  const handleResetAfternoon = () => {
    resetAfternoonMutation.mutate();
  };

  const handleResetEvening = () => {
    resetEveningMutation.mutate();
  };

  const handleResetAll = () => {
    resetAllMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Customize your Sunshine Squad experience</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6">
        {/* PIN verification required */}
        {settings?.enableSettingsPin && !isPinVerified ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings Protected</h2>
              <p className="text-gray-600 mb-6">Enter your PIN to access settings.</p>
              <Button
                onClick={() => setPinModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium"
              >
                Enter PIN
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile & Account */}
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Profile & Account</h3>
                    <p className="text-sm text-gray-500">Manage your account settings</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {user && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <div className="text-sm text-gray-600">Signed in as:</div>
                      <div className="font-medium text-gray-800">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.firstName || user.lastName || 'User'
                        }
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        View Profile Settings
                      </Label>
                    </div>
                    <Link href="/profile">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm rounded-lg min-w-[100px]"
                      >
                        <User size={14} className="mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Refresh Data
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleDataRefresh}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm rounded-lg min-w-[100px]"
                    >
                      <RefreshCw size={14} className="mr-1" />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Sign Out
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm rounded-lg min-w-[100px]"
                    >
                      <LogOut size={14} className="mr-1" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Info Bar */}
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Info Bar</h3>
                    <p className="text-sm text-gray-500">Weather and greeting settings</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Manage Weather Settings
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setWeatherModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg"
                    >
                      <Cloud size={14} className="mr-1" />
                      Weather
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="add-greeting" className="text-sm font-medium text-gray-700">
                        Add Custom News Banner
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setGreetingModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg"
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="custom-greeting" className="text-sm font-medium text-gray-700">
                        Dynamic Messages
                      </Label>
                    </div>
                    <Switch
                      id="custom-greeting"
                      checked={!useCustomMessage}
                      onCheckedChange={(checked) => {
                        setUseCustomMessage(!checked);
                        updateSettingsMutation.mutate({
                          useCustomMessage: !checked,
                          customMessage: !checked ? customMessage : undefined,
                        });
                        
                        // Force greeting data refresh after settings update
                        queryClient.invalidateQueries({ queryKey: ["/api/greeting"] });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users */}
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Users</h3>
                    <p className="text-sm text-gray-500">Manage user profiles</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Manage Users
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setUsersModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-lg"
                    >
                      <Users size={14} className="mr-1" />
                      Users
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="add-user" className="text-sm font-medium text-gray-700">
                        Add New User
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCreateChild}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-lg"
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks & Daily Management */}
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Tasks & Routines</h3>
                    <p className="text-sm text-gray-500">Manage daily tasks</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Manage Task Library
                      </Label>
                    </div>
                    <Link href="/tasks">
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-lg"
                      >
                        <Calendar size={14} className="mr-1" />
                        Tasks
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Reset Task Progress
                        </Label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={handleResetMorning}
                        disabled={resetMorningMutation.isPending}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs rounded-lg"
                      >
                        <Sun size={12} className="mr-1" />
                        Morning
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResetAfternoon}
                        disabled={resetAfternoonMutation.isPending}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-xs rounded-lg"
                      >
                        <Clock size={12} className="mr-1" />
                        Afternoon
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResetEvening}
                        disabled={resetEveningMutation.isPending}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 text-xs rounded-lg"
                      >
                        <Moon size={12} className="mr-1" />
                        Evening
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResetAll}
                        disabled={resetAllMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs rounded-lg"
                      >
                        All Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prizes & Point System */}
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Gift size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Prizes & Points</h3>
                    <p className="text-sm text-gray-500">Rewards and rules</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Manage Prizes
                      </Label>
                    </div>
                    <Link href="/prizes">
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm rounded-lg"
                      >
                        <Gift size={14} className="mr-1" />
                        Prizes
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Allocate Points
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setPointsModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-lg"
                    >
                      <Plus size={14} className="mr-1" />
                      Points
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="age-weighted" className="text-sm font-medium text-gray-700">
                        Age-Weighted Points
                      </Label>
                    </div>
                    <Switch
                      id="age-weighted"
                      checked={ageWeightedPoints}
                      onCheckedChange={handlePointsToggle}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Add Cutoff Times
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setCutoffModalOpen(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm rounded-lg min-w-[100px]"
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Child Profile Modal */}
      {childModalOpen && (
        <ChildProfileModal
          isOpen={childModalOpen}
          onClose={() => setChildModalOpen(false)}
          child={editingChild}
          mode={modalMode}
        />
      )}
      
      {/* Weather Settings Modal */}
      {weatherModalOpen && (
        <WeatherSettingsModal
          isOpen={weatherModalOpen}
          onClose={() => setWeatherModalOpen(false)}
          weatherCity={weatherCity}
          weatherUnits={weatherUnits}
          onSave={handleWeatherUpdate}
          onCityChange={setWeatherCity}
          onUnitsChange={setWeatherUnits}
          isPending={updateSettingsMutation.isPending}
        />
      )}
      
      {/* Users Modal */}
      {usersModalOpen && (
        <UsersModal
          isOpen={usersModalOpen}
          onClose={() => setUsersModalOpen(false)}
          children={children}
          onEdit={handleEditChild}
          onDelete={(childId) => deleteChildMutation.mutate(childId)}
          onAdd={handleCreateChild}
          deleteIsPending={deleteChildMutation.isPending}
        />
      )}
      
      {/* Greeting Settings Modal */}
      {greetingModalOpen && (
        <GreetingSettingsModal
          isOpen={greetingModalOpen}
          onClose={() => setGreetingModalOpen(false)}
          customMorningMessage={customMorningMessage}
          customAfternoonMessage={customAfternoonMessage}
          customEveningMessage={customEveningMessage}
          onSave={(messages) => {
            setCustomMorningMessage(messages.morning);
            setCustomAfternoonMessage(messages.afternoon);
            setCustomEveningMessage(messages.evening);
            setUseCustomMessage(true); // Enable custom message when saving
            updateSettingsMutation.mutate({
              useCustomMessage: true,
              customMorningMessage: messages.morning,
              customAfternoonMessage: messages.afternoon,
              customEveningMessage: messages.evening,
            });
            
            // Force greeting data refresh after settings update
            queryClient.invalidateQueries({ queryKey: ["/api/greeting"] });
          }}
          isPending={updateSettingsMutation.isPending}
        />
      )}

      {/* PIN Entry Modal */}
      <PinEntryModal
        isOpen={pinModalOpen}
        onClose={() => {
          // Redirect back to home if they cancel PIN entry
          window.location.href = "/";
        }}
        onSuccess={handlePinSuccess}
        title="Settings Access"
        description="This settings page is protected. Please enter your PIN to continue."
      />

      {/* Manual Points Allocation Modal */}
      <Dialog open={pointsModalOpen} onOpenChange={setPointsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Allocate Points Manually
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Child
              </Label>
              <Select
                value={selectedChildId?.toString() || ""}
                onValueChange={(value) => setSelectedChildId(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a child..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => {
                    const childColor = colorOptions.find(c => c.id === child.colour) || colorOptions[0];
                    const childAvatar = avatarOptions.find(a => a.id === child.avatarUrl);
                    const AvatarIcon = childAvatar?.icon || User;
                    
                    return (
                      <SelectItem key={child.id} value={child.id.toString()}>
                        <div className="flex items-center gap-3 py-1">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: childColor.light }}
                          >
                            <AvatarIcon 
                              size={20} 
                              style={{ color: childColor.hex }} 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{child.name}</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="px-2 py-0.5 rounded-md text-xs font-semibold text-white"
                                style={{ backgroundColor: childColor.hex }}
                              >
                                {child.points || 0} pts
                              </div>
                              <span className="text-xs text-gray-500">{childColor.name}</span>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Points to Allocate
              </Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={pointsToAllocate}
                onChange={(e) => setPointsToAllocate(parseInt(e.target.value) || 0)}
                placeholder="Enter points..."
                className="w-full"
              />
            </div>


          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setPointsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAllocatePoints}
              disabled={allocatePointsMutation.isPending || !selectedChildId || pointsToAllocate <= 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {allocatePointsMutation.isPending ? "Allocating..." : "Allocate Points"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cutoff Settings Modal */}
      <CutoffSettingsModal
        isOpen={cutoffModalOpen}
        onClose={() => setCutoffModalOpen(false)}
        settings={{
          enableMorningCutoff,
          enableAfternoonCutoff,
          enableEveningCutoff,
          morningCutoffHour,
          morningCutoffMinute,
          afternoonCutoffHour,
          afternoonCutoffMinute,
          eveningCutoffHour,
          eveningCutoffMinute,
        }}
        onSave={handleCutoffSave}
        isPending={updateSettingsMutation.isPending}
      />
    </div>
  );
}
