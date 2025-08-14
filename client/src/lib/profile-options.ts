import { 
  Crown, Star, Sparkles, Heart, Car, Truck, Plane, 
  TreePine, Flower, Sun, Moon, Zap, Flame, Snowflake, 
  Trophy, Gift, User, Smile, Cherry, Apple
} from "lucide-react";

// Avatar options for children
export const avatarOptions = [
  // Princesses & Fantasy
  { id: "princess-crown", name: "Princess Crown", icon: Crown, category: "princesses" },
  { id: "fairy-star", name: "Fairy Star", icon: Star, category: "fairies" },
  { id: "magic-sparkles", name: "Magic Sparkles", icon: Sparkles, category: "fairies" },
  { id: "fairy-heart", name: "Fairy Heart", icon: Heart, category: "fairies" },
  
  // Characters
  { id: "happy-face", name: "Happy Face", icon: Smile, category: "characters" },
  { id: "little-person", name: "Little Person", icon: User, category: "characters" },
  { id: "cherry", name: "Cherry", icon: Cherry, category: "characters" },
  { id: "apple", name: "Apple", icon: Apple, category: "characters" },
  
  // Vehicles
  { id: "car", name: "Car", icon: Car, category: "vehicles" },
  { id: "truck", name: "Truck", icon: Truck, category: "vehicles" },
  { id: "plane", name: "Airplane", icon: Plane, category: "vehicles" },
  
  // Nature
  { id: "tree", name: "Tree", icon: TreePine, category: "nature" },
  { id: "flower", name: "Flower", icon: Flower, category: "nature" },
  { id: "sun", name: "Sun", icon: Sun, category: "nature" },
  { id: "moon", name: "Moon", icon: Moon, category: "nature" },
  
  // Fun & Action
  { id: "lightning", name: "Lightning", icon: Zap, category: "action" },
  { id: "fire", name: "Fire", icon: Flame, category: "action" },
  { id: "snowflake", name: "Snowflake", icon: Snowflake, category: "action" },
  { id: "trophy", name: "Trophy", icon: Trophy, category: "action" },
  { id: "gift", name: "Gift", icon: Gift, category: "action" },
];

// Color scheme options
export const colorOptions = [
  { id: "coral", name: "Coral", hex: "#FF6B6B", light: "#FFE5E5" },
  { id: "yellow", name: "Sunny Yellow", hex: "#FFD93D", light: "#FFF8E1" },
  { id: "teal", name: "Ocean Teal", hex: "#4ECDC4", light: "#E0F7FA" },
  { id: "purple", name: "Royal Purple", hex: "#A855F7", light: "#F3E8FF" },
  { id: "green", name: "Forest Green", hex: "#10B981", light: "#ECFDF5" },
  { id: "blue", name: "Sky Blue", hex: "#3B82F6", light: "#EFF6FF" },
  { id: "pink", name: "Pretty Pink", hex: "#EC4899", light: "#FDF2F8" },
  { id: "orange", name: "Bright Orange", hex: "#F97316", light: "#FFF7ED" },
];

// Completion animation options
export const animationOptions = [
  { id: "confetti", name: "Confetti Party", emoji: "🎉", description: "Colorful confetti rain" },
  { id: "hearts", name: "Flying Hearts", emoji: "💖", description: "Floating heart bubbles" },
  { id: "stars", name: "Shooting Stars", emoji: "✨", description: "Bright shooting stars" },
  { id: "magic", name: "Magic Sparkles", emoji: "🪄", description: "Twinkling magic wand" },
  { id: "dinosaurs", name: "Roaring Dinosaurs", emoji: "🦕", description: "Friendly dinosaurs cheering" },
  { id: "princess", name: "Princess Cheer", emoji: "👸", description: "Princesses celebrating" },
  { id: "vehicles", name: "Vehicle Parade", emoji: "🚗", description: "Cars and transport fun" },
  { id: "party", name: "Party Time", emoji: "🥳", description: "Ultimate celebration!" },
];

// Age ranges for selection
export const ageOptions = [
  { value: 3, label: "3 years old" },
  { value: 4, label: "4 years old" },
  { value: 5, label: "5 years old" },
  { value: 6, label: "6 years old" },
  { value: 7, label: "7 years old" },
  { value: 8, label: "8 years old" },
  { value: 9, label: "9 years old" },
  { value: 10, label: "10 years old" },
  { value: 11, label: "11 years old" },
  { value: 12, label: "12 years old" },
];

// Function to calculate age-adjusted points
export function calculateAgeAdjustedPoints(basePoints: number, childAge: number | null, ageWeightedEnabled: boolean): number {
  if (!ageWeightedEnabled || !childAge) {
    return basePoints;
  }
  
  // Base age is 5, reduce points by 10% for each year above 5, increase by 10% for each year below 5
  const ageAdjustment = (5 - childAge) * 0.10;
  const adjustedPoints = Math.round(basePoints * (1 + ageAdjustment));
  
  // Ensure minimum of 1 point
  return Math.max(1, adjustedPoints);
}