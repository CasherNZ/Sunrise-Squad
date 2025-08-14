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
import { ArrowLeft, MessageSquare, Users, Calendar, Gift, Cloud, Plus, Edit, Trash2, User, LogOut, Sun, Moon, Clock, RefreshCw, Shield } from "lucide-react";
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
  const [pointsToAllocate, setPointsToAllocate] = useState<string>("");
  const [isDeducting, setIsDeducting] = useState(false);

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateChild = () => {
    setEditingChild(undefined);
    setModalMode("create");
    setChildModalOpen(true);
  };

  // Reset mutations
  const resetMorningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset/morning", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Morning tasks reset",
        description: "All morning task completions have been cleared.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset morning tasks.",
        variant: "destructive",
      });
    }
  });

  const resetAfternoonMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset/afternoon", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Afternoon tasks reset",
        description: "All afternoon task completions have been cleared.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset afternoon tasks.",
        variant: "destructive",
      });
    }
  });

  const resetEveningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset/evening", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Evening tasks reset",
        description: "All evening task completions have been cleared.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset evening tasks.",
        variant: "destructive",
      });
    }
  });

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      
      // Clear cascade session to allow celebrations to trigger again
      sessionStorage.removeItem(SESSION_KEY);
      
      toast({
        title: "All tasks reset",
        description: "All task completions have been cleared for today.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset all tasks.",
        variant: "destructive",
      });
    }
  });

  const allocatePointsMutation = useMutation({
    mutationFn: async (data: { childId: number | null; points: number }) => {
      if (!data.childId) throw new Error("Please select a child");
      const response = await apiRequest("POST", `/api/children/${data.childId}/points`, {
        points: data.points
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      const pointsValue = parseInt(pointsToAllocate) || 0;
      const actionText = isDeducting ? "deducted" : "added";
      toast({
        title: "Points updated",
        description: `${Math.abs(pointsValue)} points have been ${actionText}.`,
      });
      setPointsModalOpen(false);
      setSelectedChildId(null);
      setPointsToAllocate("");
      setIsDeducting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update points.",
        variant: "destructive",
      });
    }
  });

  const handleAllocatePoints = () => {
    if (!selectedChildId) {
      toast({
        title: "Selection required",
        description: "Please select a user to update points for.",
        variant: "destructive",
      });
      return;
    }

    const pointsValue = parseInt(pointsToAllocate) || 0;
    if (pointsValue === 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of points.",
        variant: "destructive",
      });
      return;
    }

    const finalPoints = isDeducting ? -pointsValue : pointsValue;
    allocatePointsMutation.mutate({
      childId: selectedChildId,
      points: finalPoints,
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

  // Weather settings functions
  const saveWeatherSettingsMutation = useMutation({
    mutationFn: async (data: { weatherCity: string; weatherUnits: string }) => {
      const response = await apiRequest("POST", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Weather settings saved",
        description: "Your weather preferences have been updated.",
      });
      setWeatherModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save weather settings.",
        variant: "destructive",
      });
    }
  });

  const handleSaveWeatherSettings = () => {
    saveWeatherSettingsMutation.mutate({
      weatherCity,
      weatherUnits
    });
  };

  // Greeting settings functions
  const saveGreetingSettingsMutation = useMutation({
    mutationFn: async (data: { morning: string; afternoon: string; evening: string }) => {
      const response = await apiRequest("PUT", "/api/settings", {
        customMorningMessage: data.morning,
        customAfternoonMessage: data.afternoon,
        customEveningMessage: data.evening
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Messages saved",
        description: "Your custom messages have been updated.",
      });
      setGreetingModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save custom messages.",
        variant: "destructive",
      });
    }
  });

  const handleSaveGreetingSettings = (messages: { morning: string; afternoon: string; evening: string }) => {
    setCustomMorningMessage(messages.morning);
    setCustomAfternoonMessage(messages.afternoon);
    setCustomEveningMessage(messages.evening);
    saveGreetingSettingsMutation.mutate(messages);
  };

  // Settings save mutations for individual switches
  const saveSettingMutation = useMutation({
    mutationFn: async (data: { ageWeightedPoints?: boolean; useCustomMessage?: boolean }) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Setting saved",
        description: "Your preference has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save setting.",
        variant: "destructive",
      });
    }
  });

  const handleAgeWeightedPointsChange = (checked: boolean) => {
    setAgeWeightedPoints(checked);
    saveSettingMutation.mutate({ ageWeightedPoints: checked });
  };

  const handleUseCustomMessageChange = (checked: boolean) => {
    // Inverted logic: when switch is ON, show dynamic messages (useCustomMessage = false)
    // when switch is OFF, show custom messages (useCustomMessage = true)
    const useCustomMessage = !checked;
    setUseCustomMessage(useCustomMessage);
    saveSettingMutation.mutate({ useCustomMessage });
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
              
              {/* Account & Profile */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-orange-600" />
                    </div>
                    Account & Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.firstName || user.lastName || 'User'
                        }
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/profile">
                      <Button variant="outline" className="w-full justify-start h-11 text-left">
                        <User size={16} className="mr-3 text-gray-500" />
                        Profile Settings
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      onClick={handleDataRefresh}
                      className="w-full justify-start h-11"
                    >
                      <RefreshCw size={16} className="mr-3 text-gray-500" />
                      Refresh Data
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full justify-start h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Weather & Messages */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Cloud size={20} className="text-blue-600" />
                    </div>
                    Weather & Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setWeatherModalOpen(true)}
                      className="w-full justify-start h-11"
                    >
                      <Cloud size={16} className="mr-3 text-gray-500" />
                      Weather Settings
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setGreetingModalOpen(true)}
                      className="w-full justify-start h-11"
                    >
                      <MessageSquare size={16} className="mr-3 text-gray-500" />
                      Custom Messages
                    </Button>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <Label htmlFor="dynamic-messages" className="text-sm font-medium text-gray-700">
                        Dynamic Messages
                      </Label>
                      <Switch
                        id="dynamic-messages"
                        checked={!useCustomMessage}
                        onCheckedChange={handleUseCustomMessageChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users & Children */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users size={20} className="text-green-600" />
                    </div>
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setUsersModalOpen(true)}
                      className="w-full justify-start h-11"
                    >
                      <Users size={16} className="mr-3 text-gray-500" />
                      Manage Users
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleCreateChild}
                      className="w-full justify-start h-11"
                    >
                      <Plus size={16} className="mr-3 text-gray-500" />
                      Add New User
                    </Button>
                  </div>
                  
                  {children.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Current Users</div>
                      <div className="space-y-2">
                        {children.map((user) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded-full" 
                              style={{ backgroundColor: user.colour }}
                            />
                            <span className="text-sm text-gray-600">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks & Routines */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar size={20} className="text-purple-600" />
                    </div>
                    Tasks & Routines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/tasks">
                      <Button variant="outline" className="w-full justify-start h-11">
                        <Calendar size={16} className="mr-3 text-gray-500" />
                        Manage Tasks
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCutoffModalOpen(true)}
                      className="w-full justify-start h-11"
                    >
                      <Clock size={16} className="mr-3 text-gray-500" />
                      Period Cutoffs
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Reset Progress</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={handleResetMorning}
                        disabled={resetMorningMutation.isPending}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                      >
                        <Sun size={12} className="mr-1" />
                        Morning
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResetAfternoon}
                        disabled={resetAfternoonMutation.isPending}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                      >
                        <Sun size={12} className="mr-1" />
                        Afternoon
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResetEvening}
                        disabled={resetEveningMutation.isPending}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs"
                      >
                        <Moon size={12} className="mr-1" />
                        Evening
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResetAll}
                        disabled={resetAllMutation.isPending}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs"
                      >
                        All Tasks
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards & Points */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Gift size={20} className="text-pink-600" />
                    </div>
                    Rewards & Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/prizes">
                      <Button variant="outline" className="w-full justify-start h-11">
                        <Gift size={16} className="mr-3 text-gray-500" />
                        Manage Prizes
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      onClick={() => setPointsModalOpen(true)}
                      className="w-full justify-start h-11"
                    >
                      <Plus size={16} className="mr-3 text-gray-500" />
                      Allocate Points
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <Label htmlFor="age-weighted" className="text-sm font-medium text-gray-700">
                      Age-Weighted Points
                    </Label>
                    <Switch
                      id="age-weighted"
                      checked={ageWeightedPoints}
                      onCheckedChange={handleAgeWeightedPointsChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security & Advanced */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Shield size={20} className="text-red-600" />
                    </div>
                    Security & Advanced
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/profile">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-11"
                      >
                        <Shield size={16} className="mr-3 text-gray-500" />
                        PIN Protection
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      onClick={handleDataRefresh}
                      className="w-full justify-start h-11"
                    >
                      <RefreshCw size={16} className="mr-3 text-gray-500" />
                      Refresh Data
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Security Notice</div>
                    <div className="text-xs text-yellow-700">
                      Access PIN protection settings in your Profile. Data refresh clears cache and reloads app data.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ChildProfileModal
        isOpen={childModalOpen}
        onClose={() => setChildModalOpen(false)}
        mode={modalMode}
        child={editingChild}
      />

      <WeatherSettingsModal
        isOpen={weatherModalOpen}
        onClose={() => setWeatherModalOpen(false)}
        weatherCity={weatherCity}
        weatherUnits={weatherUnits}
        onSave={handleSaveWeatherSettings}
        onCityChange={setWeatherCity}
        onUnitsChange={setWeatherUnits}
        isPending={saveWeatherSettingsMutation.isPending}
      />

      <UsersModal
        isOpen={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        children={children}
        onEdit={(child) => {
          setEditingChild(child);
          setModalMode("edit");
          setChildModalOpen(true);
        }}
        onDelete={() => {
          // Delete functionality would be implemented here
        }}
        onAdd={() => {
          handleCreateChild();
        }}
        deleteIsPending={false}
      />

      <GreetingSettingsModal
        isOpen={greetingModalOpen}
        onClose={() => setGreetingModalOpen(false)}
        customMorningMessage={customMorningMessage}
        customAfternoonMessage={customAfternoonMessage}
        customEveningMessage={customEveningMessage}
        onSave={handleSaveGreetingSettings}
        isPending={saveGreetingSettingsMutation.isPending}
      />

      <CutoffSettingsModal
        isOpen={cutoffModalOpen}
        onClose={() => setCutoffModalOpen(false)}
        settings={settings || {
          enableMorningCutoff: false,
          enableAfternoonCutoff: false,
          enableEveningCutoff: false,
          morningCutoffHour: 8,
          morningCutoffMinute: 0,
          afternoonCutoffHour: 15,
          afternoonCutoffMinute: 0,
          eveningCutoffHour: 20,
          eveningCutoffMinute: 0
        } as any}
        onSave={() => {
          // Cutoff settings would be saved here
          setCutoffModalOpen(false);
        }}
        isPending={false}
      />

      <PinEntryModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Points Allocation Modal */}
      <Dialog open={pointsModalOpen} onOpenChange={setPointsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-500" />
              Update Points
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="child-select" className="text-sm font-medium text-gray-700 mb-2 block">
                Select User
              </Label>
              <Select value={selectedChildId?.toString() || ""} onValueChange={(value) => setSelectedChildId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name} (Current: {child.points || 0} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="points-input" className="text-sm font-medium text-gray-700 mb-2 block">
                Points to {isDeducting ? "Deduct" : "Add"}
              </Label>
              <Input
                id="points-input"
                type="number"
                min="1"
                max="1000"
                value={pointsToAllocate}
                onChange={(e) => setPointsToAllocate(e.target.value)}
                placeholder="Enter number"
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsDeducting(false)}
                variant={!isDeducting ? "default" : "outline"}
                className="flex-1"
              >
                Add Points
              </Button>
              <Button
                type="button"
                onClick={() => setIsDeducting(true)}
                variant={isDeducting ? "default" : "outline"}
                className="flex-1"
              >
                Deduct Points
              </Button>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setPointsModalOpen(false);
                  setPointsToAllocate("");
                  setIsDeducting(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAllocatePoints}
                disabled={allocatePointsMutation.isPending || !selectedChildId || !pointsToAllocate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {allocatePointsMutation.isPending ? "Updating..." : (isDeducting ? "Deduct Points" : "Add Points")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}