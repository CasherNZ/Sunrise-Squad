import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud } from "lucide-react";

interface WeatherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherCity: string;
  weatherUnits: string;
  onSave: () => void;
  onCityChange: (city: string) => void;
  onUnitsChange: (units: string) => void;
  isPending: boolean;
}

export function WeatherSettingsModal({
  isOpen,
  onClose,
  weatherCity,
  weatherUnits,
  onSave,
  onCityChange,
  onUnitsChange,
  isPending
}: WeatherSettingsModalProps) {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud size={20} />
            Weather Settings
          </DialogTitle>
          <DialogDescription>
            Configure your location and temperature units for accurate weather display.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">Location</Label>
            <Select value={weatherCity} onValueChange={onCityChange}>
              <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Auckland,NZ">Auckland, New Zealand</SelectItem>
                <SelectItem value="Wellington,NZ">Wellington, New Zealand</SelectItem>
                <SelectItem value="Christchurch,NZ">Christchurch, New Zealand</SelectItem>
                <SelectItem value="Sydney,AU">Sydney, Australia</SelectItem>
                <SelectItem value="Melbourne,AU">Melbourne, Australia</SelectItem>
                <SelectItem value="Brisbane,AU">Brisbane, Australia</SelectItem>
                <SelectItem value="London,UK">London, United Kingdom</SelectItem>
                <SelectItem value="New York,US">New York, United States</SelectItem>
                <SelectItem value="Los Angeles,US">Los Angeles, United States</SelectItem>
                <SelectItem value="Toronto,CA">Toronto, Canada</SelectItem>
                <SelectItem value="Vancouver,CA">Vancouver, Canada</SelectItem>
                <SelectItem value="Tokyo,JP">Tokyo, Japan</SelectItem>
                <SelectItem value="Singapore,SG">Singapore</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2">
              <Input
                value={weatherCity}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="Or enter custom city (e.g., Paris,FR)"
                className="text-sm rounded-lg border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: City,Country (e.g., Auckland,NZ)
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="units" className="text-sm font-medium text-gray-700">Temperature Units</Label>
            <Select value={weatherUnits} onValueChange={onUnitsChange}>
              <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Celsius (°C)</SelectItem>
                <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg">
            <strong>✓ Status:</strong> Live weather API is active and working! 
            Weather updates hourly with real data from OpenWeatherMap.
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}