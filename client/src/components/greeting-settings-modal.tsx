import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Sun, Clock, Moon } from "lucide-react";

interface GreetingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customMorningMessage: string;
  customAfternoonMessage: string;
  customEveningMessage: string;
  onSave: (messages: { morning: string; afternoon: string; evening: string }) => void;
  isPending: boolean;
}

export function GreetingSettingsModal({
  isOpen,
  onClose,
  customMorningMessage,
  customAfternoonMessage,
  customEveningMessage,
  onSave,
  isPending
}: GreetingSettingsModalProps) {
  const [morningMessage, setMorningMessage] = useState(customMorningMessage || "");
  const [afternoonMessage, setAfternoonMessage] = useState(customAfternoonMessage || "");
  const [eveningMessage, setEveningMessage] = useState(customEveningMessage || "");

  const handleSave = () => {
    onSave({
      morning: morningMessage,
      afternoon: afternoonMessage,
      evening: eveningMessage
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            Custom News Banner
          </DialogTitle>
          <DialogDescription>
            Create custom news banners for different times of day that will replace the dynamic messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Tabs defaultValue="morning" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="morning" className="flex items-center gap-2">
                <Sun size={16} />
                Morning
              </TabsTrigger>
              <TabsTrigger value="afternoon" className="flex items-center gap-2">
                <Clock size={16} />
                Afternoon  
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center gap-2">
                <Moon size={16} />
                Evening
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="morning" className="space-y-4">
              <div>
                <Label htmlFor="morning-message" className="text-sm font-medium text-gray-700">
                  Morning News Banner
                </Label>
                <Textarea
                  id="morning-message"
                  value={morningMessage}
                  onChange={(e) => setMorningMessage(e.target.value)}
                  placeholder="Good morning! What's happening today?..."
                  className="mt-1 rounded-lg border-gray-200"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will show during morning hours (12:01 AM - 11:59 AM)
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Sun size={16} className="text-amber-600" />
                  Morning Preview:
                </h4>
                <p className="text-gray-700 italic">
                  {morningMessage || "Your morning news banner will appear here..."}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="afternoon" className="space-y-4">
              <div>
                <Label htmlFor="afternoon-message" className="text-sm font-medium text-gray-700">
                  Afternoon News Banner
                </Label>
                <Textarea
                  id="afternoon-message"
                  value={afternoonMessage}
                  onChange={(e) => setAfternoonMessage(e.target.value)}
                  placeholder="Good afternoon! How's your day going?..."
                  className="mt-1 rounded-lg border-gray-200"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will show during afternoon hours (12:00 PM - 4:59 PM)
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-orange-600" />
                  Afternoon Preview:
                </h4>
                <p className="text-gray-700 italic">
                  {afternoonMessage || "Your afternoon news banner will appear here..."}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="evening" className="space-y-4">
              <div>
                <Label htmlFor="evening-message" className="text-sm font-medium text-gray-700">
                  Evening News Banner
                </Label>
                <Textarea
                  id="evening-message"
                  value={eveningMessage}
                  onChange={(e) => setEveningMessage(e.target.value)}
                  placeholder="Good evening! Time to wind down..."
                  className="mt-1 rounded-lg border-gray-200"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will show during evening hours (5:00 PM - 12:00 AM)  
                </p>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Moon size={16} className="text-indigo-600" />
                  Evening Preview:
                </h4>
                <p className="text-gray-700 italic">
                  {eveningMessage || "Your evening news banner will appear here..."}
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Note:</strong> Remember to toggle "Dynamic Messages" off in the main settings 
            to use your custom news banners instead of the automatic greetings.
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save News Banners"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GreetingSettingsModal;