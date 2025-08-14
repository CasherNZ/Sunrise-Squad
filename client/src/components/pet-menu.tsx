import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PawPrint, Heart, Gift, Gamepad2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmojiCascade } from "@/components/emoji-cascade";
import type { Child, Pet } from "@shared/schema";

interface PetMenuProps {
  childId: number;
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
  },
  {
    id: 'kitten',
    name: 'Kitten',
    emoji: '🐱',
    environment: 'Cat Tower',
    environmentEmoji: '🏰',
    description: 'A curious and independent friend who enjoys exploring!',
    careAction: 'Stroke',
  },
  {
    id: 'fish',
    name: 'Fish',
    emoji: '🐠',
    environment: 'Beautiful Aquarium',
    environmentEmoji: '🪣',
    description: 'A peaceful swimmer who loves clean water and good food!',
    careAction: 'Watch',
  },
  {
    id: 'bird',
    name: 'Bird',
    emoji: '🐦',
    environment: 'Songbird Cage',
    environmentEmoji: '🪶',
    description: 'A cheerful singer who loves to chirp and play with toys!',
    careAction: 'Sing to',
  },
  {
    id: 'lizard',
    name: 'Lizard',
    emoji: '🦎',
    environment: 'Desert Terrarium',
    environmentEmoji: '🌵',
    description: 'A unique and calm reptile who enjoys warm environments!',
    careAction: 'Observe',
  }
];

export default function PetMenu({ childId }: PetMenuProps) {
  const { toast } = useToast();
  const [visitingPet, setVisitingPet] = useState<Pet | null>(null);
  const [showPetCelebration, setShowPetCelebration] = useState(false);

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });
  
  const child = children.find(c => c.id === childId);

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    select: (allPets: Pet[]) => allPets.filter(pet => pet.childId === childId)
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

  const handleInteraction = (pet: Pet, action: string, pointsCost: number) => {
    interactWithPetMutation.mutate({
      petId: pet.id,
      action,
      pointsCost
    });
  };

  if (pets.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🏪</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">All done!</h3>
        <p className="text-sm text-gray-600 mb-3">Great job completing all your tasks!</p>
        <Button
          onClick={() => window.location.href = '/prizes'}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-1" />
          Visit Pet Store
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">🎉</div>
        <h3 className="text-lg font-semibold text-gray-700">All done!</h3>
        <p className="text-sm text-gray-600 mb-3">Your pets are ready to play!</p>
      </div>

      <div className="space-y-3">
        {pets.map((pet) => {
          const petType = PET_TYPES.find(p => p.id === pet.type);
          
          return (
            <Dialog key={pet.id}>
              <DialogTrigger asChild>
                <Card className="hover:shadow-md transition-all cursor-pointer border-2 border-pink-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{petType?.emoji}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{pet.name}</h4>
                        <p className="text-xs text-gray-500">{petType?.name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Heart className="h-3 w-3 text-pink-500" />
                        <span>{pet.happiness || 50}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">{petType?.emoji}</span>
                    {pet.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-7xl mb-4 p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl border-3 border-pink-200 shadow-md mx-auto max-w-xs">
                      {petType?.emoji}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Living in {petType?.environment} {petType?.environmentEmoji}
                    </p>
                    <Badge variant="secondary" className="mb-4">
                      {child?.name}'s pet
                    </Badge>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Happiness Level</span>
                      <span className="text-lg font-bold text-green-600">{pet.happiness || 50}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${pet.happiness || 50}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{pet.totalTreats || 0}</div>
                        <div className="text-gray-500">Treats Given</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{pet.totalToys || 0}</div>
                        <div className="text-gray-500">Toys Bought</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{pet.totalCareActions || 0}</div>
                        <div className="text-gray-500">Care Actions</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleInteraction(pet, 'treat', 20)}
                      disabled={interactWithPetMutation.isPending || !child || (child.points || 0) < 20}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Give Treat (20 points)
                    </Button>
                    
                    <Button
                      onClick={() => handleInteraction(pet, 'toy', 30)}
                      disabled={interactWithPetMutation.isPending || !child || (child.points || 0) < 30}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Buy Toy (30 points)
                    </Button>

                    <Button
                      onClick={() => handleInteraction(pet, 'care', 0)}
                      disabled={interactWithPetMutation.isPending}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {petType?.careAction} {pet.name} (Free!)
                    </Button>

                    {child && (child.points || 0) < 20 && (
                      <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg text-sm">
                        You need more points to give treats or buy toys for {pet.name}.
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
      
      <div className="text-center pt-2">
        <Button
          onClick={() => window.location.href = '/prizes'}
          variant="outline"
          className="text-xs px-3 py-1 rounded-lg border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add More Pets
        </Button>
      </div>
      
      <EmojiCascade
        theme="pets"
        isActive={showPetCelebration}
        onComplete={() => setShowPetCelebration(false)}
      />
    </div>
  );
}