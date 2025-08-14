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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit2, Trash2, Gift, Trophy, Star, Heart, Zap, Crown, Cake, Gamepad, Music, Palette, Sparkles, Candy, Tv, Car, Book, IceCream, Pizza, Coffee, Headphones, Camera, Bike, PawPrint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { colorOptions } from "@/lib/profile-options";

import type { Prize, Child } from "@shared/schema";
import PetStoreModal from "@/components/pet-store-modal";

// Icon options for rewards
const rewardIcons = [
  { id: "gift", icon: Gift, name: "Gift" },
  { id: "trophy", icon: Trophy, name: "Trophy" },
  { id: "star", icon: Star, name: "Star" },
  { id: "heart", icon: Heart, name: "Heart" },
  { id: "zap", icon: Zap, name: "Lightning" },
  { id: "crown", icon: Crown, name: "Crown" },
  { id: "cake", icon: Cake, name: "Cake" },
  { id: "gamepad", icon: Gamepad, name: "Game" },
  { id: "music", icon: Music, name: "Music" },
  { id: "palette", icon: Palette, name: "Art" },
  { id: "sparkles", icon: Sparkles, name: "Sparkles" },
  { id: "candy", icon: Candy, name: "Candy" },
  { id: "tv", icon: Tv, name: "TV" },
  { id: "car", icon: Car, name: "Toy" },
  { id: "book", icon: Book, name: "Book" },
  { id: "ice-cream", icon: IceCream, name: "Ice Cream" },
  { id: "pizza", icon: Pizza, name: "Pizza" },
  { id: "coffee", icon: Coffee, name: "Treat" },
  { id: "headphones", icon: Headphones, name: "Music" },
  { id: "camera", icon: Camera, name: "Photo" },
  { id: "bike", icon: Bike, name: "Activity" },
];

// Form components moved outside to prevent re-creation
const AddRewardForm = ({ formData, setFormData, onSubmit }: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
}) => (
  <div className="space-y-6">
    <div>
      <Label htmlFor="add-title" className="text-sm font-medium">Reward Title</Label>
      <Input
        id="add-title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Extra Screen Time"
        className="mt-1.5"
      />
    </div>
    
    <div>
      <Label htmlFor="add-points" className="text-sm font-medium">Points Required</Label>
      <Input
        id="add-points"
        type="number"
        value={formData.targetPoints}
        onChange={(e) => setFormData({ ...formData, targetPoints: parseInt(e.target.value) || 0 })}
        min="1"
        className="mt-1.5"
      />
    </div>
    
    {/* Icon Selection */}
    <div>
      <Label className="text-sm font-medium">Icon</Label>
      <div className="grid grid-cols-5 gap-2 mt-2 max-h-32 overflow-y-auto">
        {rewardIcons.map((iconOption) => {
          const IconComponent = iconOption.icon;
          return (
            <button
              key={iconOption.id}
              type="button"
              onClick={() => setFormData({ ...formData, icon: iconOption.id })}
              className={`p-2 rounded-lg border-2 transition-all ${
                formData.icon === iconOption.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <IconComponent size={16} className={formData.icon === iconOption.id ? 'text-blue-600' : 'text-gray-600'} />
            </button>
          );
        })}
      </div>
    </div>
    
    {/* Color Selection */}
    <div>
      <Label className="text-sm font-medium">Color Theme</Label>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {colorOptions.map((colorOption) => (
          <button
            key={colorOption.id}
            type="button"
            onClick={() => setFormData({ ...formData, color: colorOption.id })}
            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
              formData.color === colorOption.id
                ? 'border-gray-800 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colorOption.hex }}
            />
            <span className="text-sm">{colorOption.name}</span>
          </button>
        ))}
      </div>
    </div>
    
    <Button 
      onClick={onSubmit} 
      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl"
    >
      Create Reward
    </Button>
  </div>
);

const EditRewardForm = ({ formData, setFormData, onSubmit }: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
}) => (
  <div className="space-y-6">
    <div>
      <Label htmlFor="edit-title" className="text-sm font-medium">Reward Title</Label>
      <Input
        id="edit-title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Extra Screen Time"
        className="mt-1.5"
      />
    </div>
    
    <div>
      <Label htmlFor="edit-points" className="text-sm font-medium">Points Required</Label>
      <Input
        id="edit-points"
        type="number"
        value={formData.targetPoints}
        onChange={(e) => setFormData({ ...formData, targetPoints: parseInt(e.target.value) || 0 })}
        min="1"
        className="mt-1.5"
      />
    </div>
    
    {/* Icon Selection */}
    <div>
      <Label className="text-sm font-medium">Icon</Label>
      <div className="grid grid-cols-5 gap-2 mt-2 max-h-32 overflow-y-auto">
        {rewardIcons.map((iconOption) => {
          const IconComponent = iconOption.icon;
          return (
            <button
              key={iconOption.id}
              type="button"
              onClick={() => setFormData({ ...formData, icon: iconOption.id })}
              className={`p-2 rounded-lg border-2 transition-all ${
                formData.icon === iconOption.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <IconComponent size={16} className={formData.icon === iconOption.id ? 'text-blue-600' : 'text-gray-600'} />
            </button>
          );
        })}
      </div>
    </div>
    
    {/* Color Selection */}
    <div>
      <Label className="text-sm font-medium">Color Theme</Label>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {colorOptions.map((colorOption) => (
          <button
            key={colorOption.id}
            type="button"
            onClick={() => setFormData({ ...formData, color: colorOption.id })}
            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
              formData.color === colorOption.id
                ? 'border-gray-800 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colorOption.hex }}
            />
            <span className="text-sm">{colorOption.name}</span>
          </button>
        ))}
      </div>
    </div>
    
    <Button 
      onClick={onSubmit} 
      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl"
    >
      Update Reward
    </Button>
  </div>
);

export default function RewardsPage() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isPetStoreOpen, setIsPetStoreOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [redeemingPrize, setRedeemingPrize] = useState<Prize | null>(null);
  const [selectedChildForRedeem, setSelectedChildForRedeem] = useState<number | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [congratulationsChild, setCongratulationsChild] = useState<Child | null>(null);
  const [addFormData, setAddFormData] = useState({
    title: "",
    targetPoints: 50,
    imageUrl: "",
    icon: "gift",
    color: "purple",
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    targetPoints: 50,
    imageUrl: "",
    icon: "gift",
    color: "purple",
  });

  const { data: prizes = [] } = useQuery<Prize[]>({
    queryKey: ["/api/prizes"],
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const createPrizeMutation = useMutation({
    mutationFn: async (data: typeof addFormData) => {
      const response = await apiRequest("POST", "/api/prizes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
      setIsAddModalOpen(false);
      setAddFormData({ title: "", targetPoints: 50, imageUrl: "", icon: "gift", color: "purple" });
      toast({
        title: "Reward added",
        description: "The new reward has been created successfully.",
      });
    },
  });

  const updatePrizeMutation = useMutation({
    mutationFn: async (data: { id: number } & typeof editFormData) => {
      const response = await apiRequest("PUT", `/api/prizes/${data.id}`, {
        title: data.title,
        targetPoints: data.targetPoints,
        imageUrl: data.imageUrl,
        icon: data.icon,
        color: data.color,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
      setIsEditModalOpen(false);
      setEditingPrize(null);
      toast({
        title: "Reward updated",
        description: "The reward has been updated successfully.",
      });
    },
  });

  const deletePrizeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/prizes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
      toast({
        title: "Reward deleted",
        description: "The reward has been removed successfully.",
      });
    },
  });

  const redeemPrizeMutation = useMutation({
    mutationFn: async ({ childId, prizeId, pointsCost }: { childId: number; prizeId: number; pointsCost: number }) => {
      const response = await apiRequest("POST", "/api/redeem-prize", {
        childId,
        prizeId,
        pointsCost,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      setIsRedeemModalOpen(false);
      setRedeemingPrize(null);
      setSelectedChildForRedeem(null);
      
      // Show congratulations
      const child = children.find(c => c.id === variables.childId);
      if (child) {
        setCongratulationsChild(child);
        setShowCongratulations(true);
        setTimeout(() => setShowCongratulations(false), 3000);
      }
      
      toast({
        title: "Reward redeemed!",
        description: `${child?.name} has redeemed their reward!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sorry, not enough points",
        description: "This child doesn't have enough points for this reward.",
        variant: "destructive",
      });
    },
  });

  const handleAddPrize = () => {
    if (addFormData.title.trim() && addFormData.targetPoints > 0) {
      createPrizeMutation.mutate(addFormData);
    }
  };

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    setEditFormData({
      title: prize.title,
      targetPoints: prize.targetPoints,
      imageUrl: prize.imageUrl || "",
      icon: prize.icon || "gift",
      color: prize.color || "purple",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePrize = () => {
    if (editingPrize && editFormData.title.trim() && editFormData.targetPoints > 0) {
      updatePrizeMutation.mutate({ id: editingPrize.id, ...editFormData });
    }
  };

  const handleRedeemPrize = (prize: Prize) => {
    setRedeemingPrize(prize);
    setIsRedeemModalOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (redeemingPrize && selectedChildForRedeem) {
      redeemPrizeMutation.mutate({
        childId: selectedChildForRedeem,
        prizeId: redeemingPrize.id,
        pointsCost: redeemingPrize.targetPoints,
      });
    }
  };

  const getProgressForPrize = (prize: Prize) => {
    // Calculate progress based on highest child points
    const maxPoints = Math.max(...children.map(c => c.points || 0), 0);
    return Math.min(100, (maxPoints / prize.targetPoints) * 100);
  };

  if (showCongratulations && congratulationsChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-orange-600">Congratulations!</h1>
            <p className="text-xl text-gray-700">
              <span className="font-semibold">{congratulationsChild.name}</span> redeemed their reward!
            </p>
          </div>
          <div className="text-6xl animate-pulse">🏆</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
              <p className="text-gray-600 mt-1">Manage rewards and prizes for your children</p>
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Reward</DialogTitle>
              </DialogHeader>
              <AddRewardForm 
                formData={addFormData}
                setFormData={setAddFormData}
                onSubmit={handleAddPrize}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Pet Store Modal */}
        <PetStoreModal isOpen={isPetStoreOpen} onClose={() => setIsPetStoreOpen(false)} />

        {/* Pet Store Card */}
        <div className="mb-8">
          <Card 
            className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border-2 border-pink-200"
            onClick={() => setIsPetStoreOpen(true)}
          >
            <div className="p-6 bg-gradient-to-br from-pink-400 to-purple-500 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <PawPrint size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">Pet Store</h3>
                  <p className="text-sm opacity-90">Adopt and care for virtual pets!</p>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-75">
                Each pet costs 200 points • Feed treats for 20 points • Buy toys and more!
              </div>
            </div>
          </Card>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {prizes.map((prize) => {
            const colorOption = colorOptions.find(c => c.id === prize.color) || colorOptions[0];
            const iconOption = rewardIcons.find(i => i.id === prize.icon) || rewardIcons[0];
            const IconComponent = iconOption.icon;
            const progress = getProgressForPrize(prize);
            const canRedeem = children.some(child => (child.points || 0) >= prize.targetPoints);
            
            return (
              <Card key={prize.id} className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div 
                  className="p-6 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${colorOption.hex}, ${colorOption.hex}dd)` 
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                      <IconComponent size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{prize.title}</h3>
                      <p className="text-sm opacity-90">{prize.targetPoints} points</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm opacity-75">{Math.round(progress)}% progress</p>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  {/* Children Progress */}
                  <div className="space-y-3">
                    {children.map(child => {
                      const childProgress = Math.min(100, ((child.points || 0) / prize.targetPoints) * 100);
                      const childCanRedeem = (child.points || 0) >= prize.targetPoints;
                      
                      return (
                        <div key={child.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: child.colour }} 
                            />
                            <span className="text-sm font-medium">{child.name}</span>
                            <span className="text-xs text-gray-500">
                              {child.points || 0}/{prize.targetPoints}
                            </span>
                          </div>
                          {childCanRedeem && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedChildForRedeem(child.id);
                                handleRedeemPrize(prize);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg"
                            >
                              Redeem
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditPrize(prize)}
                      className="flex-1 rounded-lg"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deletePrizeMutation.mutate(prize.id)}
                      className="rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) { setEditingPrize(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Reward</DialogTitle>
            </DialogHeader>
            <EditRewardForm 
              formData={editFormData}
              setFormData={setEditFormData}
              onSubmit={handleUpdatePrize}
            />
          </DialogContent>
        </Dialog>

        {/* Redeem Modal */}
        <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Redeem Reward</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-6xl">🎉</div>
                <h3 className="text-lg font-semibold">
                  Redeem "{redeemingPrize?.title}"?
                </h3>
                <p className="text-gray-600">
                  This will cost {redeemingPrize?.targetPoints} points
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRedeemModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmRedeem}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  Confirm Redeem
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}