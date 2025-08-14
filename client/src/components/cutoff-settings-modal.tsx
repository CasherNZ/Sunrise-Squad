import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Sun, Moon, AlertTriangle } from "lucide-react";

interface CutoffSettings {
  enableMorningCutoff: boolean;
  enableAfternoonCutoff: boolean;
  enableEveningCutoff: boolean;
  morningCutoffHour: number;
  morningCutoffMinute: number;
  afternoonCutoffHour: number;
  afternoonCutoffMinute: number;
  eveningCutoffHour: number;
  eveningCutoffMinute: number;
}

interface CutoffSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CutoffSettings;
  onSave: (settings: CutoffSettings) => void;
  isPending: boolean;
}

export function CutoffSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isPending
}: CutoffSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<CutoffSettings>({
    enableMorningCutoff: settings.enableMorningCutoff || false,
    enableAfternoonCutoff: settings.enableAfternoonCutoff || false,
    enableEveningCutoff: settings.enableEveningCutoff || false,
    morningCutoffHour: settings.morningCutoffHour || 8,
    morningCutoffMinute: settings.morningCutoffMinute || 0,
    afternoonCutoffHour: settings.afternoonCutoffHour || 15,
    afternoonCutoffMinute: settings.afternoonCutoffMinute || 0,
    eveningCutoffHour: settings.eveningCutoffHour || 20,
    eveningCutoffMinute: settings.eveningCutoffMinute || 0,
  });

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateSetting = (key: keyof CutoffSettings, value: boolean | number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={20} />
            Points Cutoff Times
          </DialogTitle>
          <DialogDescription>
            Set specific cutoff times for each period. Tasks completed after the cutoff forfeit all points.
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
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <Sun size={20} className="text-amber-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-800">
                      Morning Points Cutoff
                    </Label>
                    <p className="text-xs text-gray-600">
                      Period: 12:01 AM - 11:59 AM
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.enableMorningCutoff}
                  onCheckedChange={(checked) => updateSetting('enableMorningCutoff', checked)}
                />
              </div>
              
              {localSettings.enableMorningCutoff && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Cutoff Time (24-hour format)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="11"
                        value={localSettings.morningCutoffHour}
                        onChange={(e) => updateSetting('morningCutoffHour', parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                      <span className="text-sm text-gray-500">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={localSettings.morningCutoffMinute}
                        onChange={(e) => updateSetting('morningCutoffMinute', parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                      <span className="text-sm font-medium text-amber-600">
                        ({formatTime(localSettings.morningCutoffHour, localSettings.morningCutoffMinute)})
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Effect:</p>
                        <p className="text-xs text-orange-700">
                          Morning tasks completed after {formatTime(localSettings.morningCutoffHour, localSettings.morningCutoffMinute)} will earn 0 points until afternoon period starts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="afternoon" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-orange-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-800">
                      Afternoon Points Cutoff
                    </Label>
                    <p className="text-xs text-gray-600">
                      Period: 12:00 PM - 4:59 PM
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.enableAfternoonCutoff}
                  onCheckedChange={(checked) => updateSetting('enableAfternoonCutoff', checked)}
                />
              </div>
              
              {localSettings.enableAfternoonCutoff && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Cutoff Time (24-hour format)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="12"
                        max="16"
                        value={localSettings.afternoonCutoffHour}
                        onChange={(e) => updateSetting('afternoonCutoffHour', parseInt(e.target.value) || 12)}
                        className="w-16 text-center"
                      />
                      <span className="text-sm text-gray-500">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={localSettings.afternoonCutoffMinute}
                        onChange={(e) => updateSetting('afternoonCutoffMinute', parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                      <span className="text-sm font-medium text-orange-600">
                        ({formatTime(localSettings.afternoonCutoffHour, localSettings.afternoonCutoffMinute)})
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Effect:</p>
                        <p className="text-xs text-orange-700">
                          Afternoon tasks completed after {formatTime(localSettings.afternoonCutoffHour, localSettings.afternoonCutoffMinute)} will earn 0 points until evening period starts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="evening" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-indigo-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-800">
                      Evening Points Cutoff
                    </Label>
                    <p className="text-xs text-gray-600">
                      Period: 5:00 PM - 12:00 AM
                    </p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.enableEveningCutoff}
                  onCheckedChange={(checked) => updateSetting('enableEveningCutoff', checked)}
                />
              </div>
              
              {localSettings.enableEveningCutoff && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Cutoff Time (24-hour format)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="17"
                        max="23"
                        value={localSettings.eveningCutoffHour}
                        onChange={(e) => updateSetting('eveningCutoffHour', parseInt(e.target.value) || 17)}
                        className="w-16 text-center"
                      />
                      <span className="text-sm text-gray-500">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={localSettings.eveningCutoffMinute}
                        onChange={(e) => updateSetting('eveningCutoffMinute', parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                      <span className="text-sm font-medium text-indigo-600">
                        ({formatTime(localSettings.eveningCutoffHour, localSettings.eveningCutoffMinute)})
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Effect:</p>
                        <p className="text-xs text-orange-700">
                          Evening tasks completed after {formatTime(localSettings.eveningCutoffHour, localSettings.eveningCutoffMinute)} will earn 0 points until morning period starts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Note:</strong> Cutoff times only apply to their respective periods. When a new period starts, the previous cutoff is reset and points are available again until the new period's cutoff time is reached.
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Cutoff Times"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}