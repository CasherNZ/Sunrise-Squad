import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, User } from "lucide-react";
import { avatarOptions, colorOptions, animationOptions, ageOptions } from "@/lib/profile-options";
import type { Child, InsertChild } from "@shared/schema";

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  child?: Child;
  mode: "create" | "edit";
}

export function ChildProfileModal({ isOpen, onClose, child, mode }: ChildProfileModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<InsertChild>>({
    name: "",
    avatarUrl: "",
    avatarType: "icon",
    colour: "coral",
    age: 6,
    completionAnimation: "confetti",
  });

  useEffect(() => {
    if (child && mode === "edit") {
      setFormData({
        name: child.name,
        avatarUrl: child.avatarUrl || "",
        avatarType: child.avatarType || "icon",
        colour: child.colour,
        age: child.age || 6,
        completionAnimation: child.completionAnimation || "confetti",
      });
    } else {
      setFormData({
        name: "",
        avatarUrl: "",
        avatarType: "icon",
        colour: "coral",
        age: 6,
        completionAnimation: "confetti",
      });
    }
  }, [child, mode, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<InsertChild>) => {
      const url = mode === "edit" ? `/api/children/${child?.id}` : "/api/children";
      const method = mode === "edit" ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: mode === "edit" ? "Profile updated" : "Profile created",
        description: `${formData.name}'s profile has been ${mode === "edit" ? "updated" : "created"} successfully.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the child.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const selectedColor = colorOptions.find(c => c.id === formData.colour);
  const selectedAvatar = avatarOptions.find(a => a.id === formData.avatarUrl);
  const selectedAnimation = animationOptions.find(a => a.id === formData.completionAnimation);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Profile" : "Create New Profile"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter child's name"
              required
            />
          </div>

          {/* Age Selection */}
          <div className="space-y-2">
            <Label>Age</Label>
            <Select
              value={formData.age?.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, age: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((age) => (
                  <SelectItem key={age.value} value={age.value.toString()}>
                    {age.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Avatar</Label>
            <Tabs value={formData.avatarType || "icon"} onValueChange={(value) => setFormData(prev => ({ ...prev, avatarType: value }))}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="icon">Choose Icon</TabsTrigger>
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
              </TabsList>
              
              <TabsContent value="icon" className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map((avatar) => {
                    const IconComponent = avatar.icon;
                    const isSelected = formData.avatarUrl === avatar.id;
                    return (
                      <Card
                        key={avatar.id}
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? `ring-2 ring-${selectedColor?.id || 'coral'}-500 bg-${selectedColor?.id || 'coral'}-50` 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, avatarUrl: avatar.id }))}
                      >
                        <CardContent className="p-2 flex flex-col items-center">
                          <IconComponent size={24} className={isSelected ? 'text-${selectedColor?.id || \'coral\'}-600' : 'text-gray-600'} />
                          <span className="text-xs mt-1 text-center">{avatar.name}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Upload an image
                      </span>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // For now, we'll store the file name as the avatarUrl
                            // In a real implementation, you'd upload to a service
                            setFormData(prev => ({ ...prev, avatarUrl: file.name }));
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  {formData.avatarUrl && formData.avatarType === "upload" && (
                    <p className="text-sm text-green-600 mt-2">File: {formData.avatarUrl}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => {
                const isSelected = formData.colour === color.id;
                return (
                  <Card
                    key={color.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-gray-400 scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, colour: color.id }))}
                  >
                    <CardContent className="p-3 flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs mt-2 text-center font-medium">{color.name}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Completion Animation */}
          <div className="space-y-3">
            <Label>Completion Animation</Label>
            <div className="grid grid-cols-2 gap-3">
              {animationOptions.map((animation) => {
                const isSelected = formData.completionAnimation === animation.id;
                return (
                  <Card
                    key={animation.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? `ring-2 ring-${selectedColor?.id || 'coral'}-500 bg-${selectedColor?.id || 'coral'}-50` 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, completionAnimation: animation.id }))}
                  >
                    <CardContent className="p-3 flex items-center space-x-3">
                      <span className="text-2xl">{animation.emoji}</span>
                      <div>
                        <div className="font-medium text-sm">{animation.name}</div>
                        <div className="text-xs text-gray-500">{animation.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <Card className="p-4" style={{ borderColor: selectedColor?.hex }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedColor?.light }}
                >
                  {formData.avatarType === "icon" && selectedAvatar ? (
                    <selectedAvatar.icon size={20} style={{ color: selectedColor?.hex }} />
                  ) : (
                    <User size={20} style={{ color: selectedColor?.hex }} />
                  )}
                </div>
                <div>
                  <div className="font-medium">{formData.name || "Child Name"}</div>
                  <div className="text-sm text-gray-500">
                    Age {formData.age} • {selectedAnimation?.name}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : mode === "edit" ? "Update Profile" : "Create Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}