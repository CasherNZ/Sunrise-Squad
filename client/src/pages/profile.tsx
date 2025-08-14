import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Mail, User, Clock, ArrowLeft, LogOut, Loader2, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Settings } from "@shared/schema";

export default function Profile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [newPin, setNewPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  
  // Get current settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // PIN management mutations
  const updatePinMutation = useMutation({
    mutationFn: async (data: { pin?: string; enabled: boolean }) => {
      const response = await apiRequest("PUT", "/api/settings", {
        settingsPin: data.enabled ? data.pin : null,
        enableSettingsPin: data.enabled,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "PIN settings updated",
        description: "Your PIN protection settings have been saved.",
      });
      setNewPin("");
    },
  });

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const memberSince = new Date(user.createdAt || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName || 'User'
              }
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center p-3 bg-muted rounded-md">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <div className="flex items-center p-3 bg-muted rounded-md">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Account Status
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Active Account
                  </Badge>
                  <Badge variant="secondary">
                    Morning Routine User
                  </Badge>
                </div>
              </div>

              {/* PIN Protection Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Settings Protection
                </h3>
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Enable PIN Protection</Label>
                      <p className="text-xs text-muted-foreground">
                        Require a PIN to access settings and prevent children from making changes
                      </p>
                    </div>
                    <Switch
                      checked={settings?.enableSettingsPin || false}
                      onCheckedChange={(enabled) => {
                        if (!enabled) {
                          updatePinMutation.mutate({ enabled: false });
                        }
                      }}
                      disabled={updatePinMutation.isPending}
                    />
                  </div>

                  {settings?.enableSettingsPin && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Lock className="h-4 w-4" />
                          Settings are currently protected with a PIN
                        </div>
                        <div>
                          <Label htmlFor="new-pin" className="text-sm">Change PIN</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="relative flex-1">
                              <Input
                                id="new-pin"
                                type={showPin ? "text" : "password"}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                placeholder="Enter new PIN"
                                maxLength={6}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPin(!showPin)}
                              >
                                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <Button
                              onClick={() => {
                                if (newPin.length >= 3) {
                                  updatePinMutation.mutate({ pin: newPin, enabled: true });
                                }
                              }}
                              disabled={!newPin || newPin.length < 3 || updatePinMutation.isPending}
                            >
                              Update
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            PIN must be at least 3 characters long
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!settings?.enableSettingsPin && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="setup-pin" className="text-sm">Set PIN</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="relative flex-1">
                              <Input
                                id="setup-pin"
                                type={showPin ? "text" : "password"}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                placeholder="Create a PIN"
                                maxLength={6}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPin(!showPin)}
                              >
                                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <Button
                              onClick={() => {
                                if (newPin.length >= 3) {
                                  updatePinMutation.mutate({ pin: newPin, enabled: true });
                                }
                              }}
                              disabled={!newPin || newPin.length < 3 || updatePinMutation.isPending}
                            >
                              Enable
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            PIN will be required to access settings
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/settings">
                    <Button variant="outline" className="w-full">
                      App Settings
                    </Button>
                  </Link>
                  <Link href="/tasks">
                    <Button variant="outline" className="w-full">
                      Manage Tasks
                    </Button>
                  </Link>
                  <Link href="/prizes">
                    <Button variant="outline" className="w-full">
                      View Rewards
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" disabled>
                    Change Password
                    <span className="text-xs ml-2">(Coming Soon)</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}