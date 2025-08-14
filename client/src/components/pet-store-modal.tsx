import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Heart, Fish, Bird, Gamepad2, Gift, ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmojiCascade } from "@/components/emoji-cascade";
import type { Child, Pet, Task, TaskCompletion } from "@shared/schema";
import dayjs from "dayjs";

interface PetStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Pet type definitions with their characteristics
const PET_TYPES = [
  {
    id: 'puppy',
    name: 'Puppy',
    emoji: '🐶',
    environment: 'Cozy Kennel',
    environmentEmoji: '🏠',
    description: 'A playful and loyal companion who loves treats and toys!',
    careAction: 'Pat',
    icon: PawPrint
  },
  {
    id: 'kitten',
    name: 'Kitten',
    emoji: '🐱',
    environment: 'Cat Tower',
    environmentEmoji: '🏰',
    description: 'A curious and independent friend who enjoys exploring!',
    careAction: 'Stroke',
    icon: Heart
  },
  {
    id: 'fish',
    name: 'Fish',
    emoji: '🐠',
    environment: 'Beautiful Aquarium',
    environmentEmoji: '🪣',
    description: 'A peaceful swimmer who loves clean water and good food!',
    careAction: 'Watch',
    icon: Fish
  },
  {
    id: 'bird',
    name: 'Bird',
    emoji: '🐦',
    environment: 'Songbird Cage',
    environmentEmoji: '🪶',
    description: 'A cheerful singer who loves to chirp and play with toys!',
    careAction: 'Sing to',
    icon: Bird
  },
  {
    id: 'lizard',
    name: 'Lizard',
    emoji: '🦎',
    environment: 'Desert Terrarium',
    environmentEmoji: '🌵',
    description: 'A unique and calm reptile who enjoys warm environments!',
    careAction: 'Observe',
    icon: Gamepad2
  }
];

export default function PetStoreModal({ isOpen, onClose }: PetStoreModalProps) {
  const { toast } = useToast();
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [petName, setPetName] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'store' | 'purchase' | 'visit'>('store');
  const [visitingPet, setVisitingPet] = useState<Pet | null>(null);
  const [showPetCelebration, setShowPetCelebration] = useState(false);

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    enabled: isOpen,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: isOpen,
  });

  const { data: completions = [] } = useQuery<TaskCompletion[]>({
    queryKey: ["/api/task-completions/date", dayjs().format("YYYY-MM-DD")],
    enabled: isOpen,
  });

  const { data: currentTimeType } = useQuery<{timeType: string}>({
    queryKey: ["/api/current-time-type"],
    enabled: isOpen,
  });

  // Check if all tasks are completed (global check for backwards compatibility)
  const areAllTasksCompleted = () => {
    if (tasks.length === 0) return false;
    
    const today = dayjs().format("YYYY-MM-DD");
    const todayCompletions = completions.filter(c => c.dateISO === today);
    
    return tasks.every(task => 
      todayCompletions.some(completion => completion.taskId === task.id)
    );
  };

  const allTasksCompleted = areAllTasksCompleted();

  // Check if a specific child's tasks are completed for the current period
  const areChildTasksCompleted = (childId: number) => {
    if (!currentTimeType) return false;
    
    // Filter tasks for this child and current time period
    const childTasks = tasks.filter(task => {
      if (task.childId !== childId) return false;
      if (task.timeType !== currentTimeType.timeType) return false;
      
      // Check if task is scheduled for today
      const dayOfWeek = dayjs().day(); // 0 = Sunday, 6 = Saturday
      return task.weekdayMask && task.weekdayMask[dayOfWeek] === '1';
    });
    
    if (childTasks.length === 0) return true; // No tasks means "completed"
    
    const today = dayjs().format("YYYY-MM-DD");
    const todayCompletions = completions.filter(c => c.dateISO === today && c.childId === childId);
    
    return childTasks.every(task => 
      todayCompletions.some(completion => completion.taskId === task.id)
    );
  };

  const purchasePetMutation = useMutation({
    mutationFn: async (data: { childId: number; type: string; name: string }) => {
      const response = await apiRequest("POST", "/api/pets", data);
      return response.json();
    },
    onSuccess: (newPet) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Pet adopted!",
        description: `${newPet.name} the ${newPet.type} is now part of the family!`,
      });
      setCurrentView('store');
      setPetName('');
      setSelectedPetType('');
      setSelectedChildId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Adoption failed",
        description: error.message || "Not enough points to adopt this pet.",
        variant: "destructive",
      });
    }
  });

  const interactWithPetMutation = useMutation({
    mutationFn: async (data: { petId: number; action: string; pointsCost: number }) => {
      const response = await apiRequest("POST", `/api/pets/${data.petId}/interact`, {
        action: data.action,
        pointsCost: data.pointsCost
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      
      // Check if pet reached 100% happiness and trigger celebration
      if (data.pet && data.pet.happiness === 100) {
        setShowPetCelebration(true);
      }
      
      toast({
        title: "Interaction successful!",
        description: "Your pet is happier now!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Interaction failed",
        description: error.message || "Not enough points for this interaction.",
        variant: "destructive",
      });
    }
  });

  const handlePurchase = () => {
    if (selectedChildId && selectedPetType && petName.trim()) {
      purchasePetMutation.mutate({
        childId: selectedChildId,
        type: selectedPetType,
        name: petName.trim()
      });
    }
  };

  const handleInteraction = (action: string, pointsCost: number) => {
    if (visitingPet) {
      interactWithPetMutation.mutate({
        petId: visitingPet.id,
        action,
        pointsCost
      });
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);
  const selectedPetTypeData = PET_TYPES.find(p => p.id === selectedPetType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <PawPrint className="text-pink-500" />
            Pet Store
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {currentView === 'store' && (
            <div className="space-y-6">
              {/* Existing Pets Section */}
              {pets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="text-pink-500" />
                    Your Pets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {pets.map((pet) => {
                      const petType = PET_TYPES.find(p => p.id === pet.type);
                      const owner = children.find(c => c.id === pet.childId);
                      
                      const childTasksCompleted = areChildTasksCompleted(pet.childId);
                      
                      return (
                        <Card key={pet.id} className={`hover:shadow-lg transition-all ${childTasksCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`} onClick={() => {
                          if (childTasksCompleted) {
                            setVisitingPet(pet);
                            setCurrentView('visit');
                          }
                        }}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{petType?.emoji}</span>
                                <div>
                                  <h4 className="font-semibold">{pet.name}</h4>
                                  <p className="text-sm text-gray-500">{petType?.name}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-pink-100 text-pink-600">
                                  {owner?.name}'s pet
                                </Badge>
                                {!childTasksCompleted && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 flex items-center gap-1">
                                    <Lock size={10} />
                                    Tasks needed
                                  </Badge>
                                )}
                                {childTasksCompleted && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-600 flex items-center gap-1">
                                    <CheckCircle size={10} />
                                    Available
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">Happiness:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-400 h-2 rounded-full transition-all"
                                  style={{ width: `${pet.happiness || 50}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{pet.happiness || 50}%</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Treats given: {pet.totalTreats || 0} • Toys: {pet.totalToys || 0}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Task Status Message */}
              {(() => {
                const availablePets = pets.filter(pet => areChildTasksCompleted(pet.childId));
                const lockedPets = pets.filter(pet => !areChildTasksCompleted(pet.childId));
                
                if (lockedPets.length > 0 && availablePets.length === 0) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎯</div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Complete tasks to play with your pets!</h4>
                          <p className="text-blue-600 text-sm">Each child needs to finish their tasks before their pets can play.</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (availablePets.length > 0) {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎉</div>
                        <div>
                          <h4 className="font-semibold text-green-800">Some pets are ready to play!</h4>
                          <p className="text-green-600 text-sm">Click on available pets to visit and interact with them.</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()}

              {/* Available Pets Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Pets to Adopt</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PET_TYPES.map((petType) => (
                    <Card key={petType.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => {
                      setSelectedPetType(petType.id);
                      setCurrentView('purchase');
                    }}>
                      <CardContent className="p-6 text-center">
                        <div className="text-6xl mb-3">{petType.emoji}</div>
                        <h4 className="text-lg font-semibold mb-2">{petType.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{petType.description}</p>
                        <Badge className="bg-purple-100 text-purple-600">200 points</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'purchase' && selectedPetTypeData && (
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('store')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{selectedPetTypeData.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">Adopt a {selectedPetTypeData.name}</h3>
                <p className="text-gray-600 mb-4">{selectedPetTypeData.description}</p>
                <Badge className="bg-purple-100 text-purple-600 text-lg px-4 py-2">200 points</Badge>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <Label htmlFor="pet-name">Pet Name</Label>
                  <Input
                    id="pet-name"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder={`Give your ${selectedPetTypeData.name.toLowerCase()} a name...`}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Who is adopting this pet?</Label>
                  <Select value={selectedChildId?.toString() || ""} onValueChange={(value) => setSelectedChildId(parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: child.colour }}
                            />
                            {child.name} ({child.points || 0} points)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedChild && (selectedChild.points || 0) < 200 && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {selectedChild.name} needs {200 - (selectedChild.points || 0)} more points to adopt this pet.
                  </div>
                )}

                <Button 
                  onClick={handlePurchase}
                  disabled={!petName.trim() || !selectedChildId || (selectedChild && (selectedChild.points || 0) < 200) || purchasePetMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl"
                >
                  {purchasePetMutation.isPending ? 'Adopting...' : 'Adopt Pet'}
                </Button>
              </div>
            </div>
          )}

          {currentView === 'visit' && visitingPet && (
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('store')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              
              {(() => {
                const petType = PET_TYPES.find(p => p.id === visitingPet.type);
                const owner = children.find(c => c.id === visitingPet.childId);
                
                return (
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="text-9xl mb-4 p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-3xl border-4 border-pink-200 shadow-lg mx-auto max-w-xs">
                        {petType?.emoji}
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">{visitingPet.name}</h3>
                      <p className="text-gray-600 text-lg mb-2">Living in {petType?.environment} {petType?.environmentEmoji}</p>
                      <Badge variant="secondary" className="text-sm px-3 py-1">Owned by {owner?.name}</Badge>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Happiness Level</span>
                        <span className="text-lg font-bold text-green-600">{visitingPet.happiness || 50}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${visitingPet.happiness || 50}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{visitingPet.totalTreats || 0}</div>
                          <div className="text-gray-500">Treats Given</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{visitingPet.totalToys || 0}</div>
                          <div className="text-gray-500">Toys Bought</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{visitingPet.totalCareActions || 0}</div>
                          <div className="text-gray-500">Care Actions</div>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const owner = children.find(c => c.id === visitingPet.childId);
                      const ownerTasksCompleted = visitingPet ? areChildTasksCompleted(visitingPet.childId) : false;
                      
                      return ownerTasksCompleted ? (
                      <div className="space-y-3 max-w-md mx-auto">
                        <Button
                          onClick={() => handleInteraction('treat', 20)}
                          disabled={interactWithPetMutation.isPending || (owner && (owner.points || 0) < 20)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Give Treat (20 points)
                        </Button>
                        
                        <Button
                          onClick={() => handleInteraction('toy', 30)}
                          disabled={interactWithPetMutation.isPending || (owner && (owner.points || 0) < 30)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
                        >
                          <Gamepad2 className="h-4 w-4 mr-2" />
                          Buy Toy (30 points)
                        </Button>

                        <Button
                          onClick={() => handleInteraction('care', 0)}
                          disabled={interactWithPetMutation.isPending}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          {petType?.careAction} {visitingPet.name} (Free!)
                        </Button>

                        {owner && (owner.points || 0) < 20 && (
                          <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg text-sm">
                            {owner.name} needs more points to give treats or buy toys for {visitingPet.name}.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto text-center">
                        <Lock className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-blue-800 mb-2">Complete {owner?.name}'s Tasks First!</h4>
                        <p className="text-blue-600 text-sm">
                          {visitingPet.name} is waiting for {owner?.name} to finish all their tasks before playing together.
                        </p>
                      </div>
                    );
                  })()}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        <EmojiCascade
          theme="pets"
          isActive={showPetCelebration}
          onComplete={() => setShowPetCelebration(false)}
        />
      </DialogContent>
    </Dialog>
  );
}