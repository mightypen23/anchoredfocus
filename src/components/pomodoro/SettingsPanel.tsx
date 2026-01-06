import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  focusDuration: number;
  breakDuration: number;
  onFocusChange: (value: number) => void;
  onBreakChange: (value: number) => void;
}

export function SettingsPanel({
  focusDuration,
  breakDuration,
  onFocusChange,
  onBreakChange,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6 p-4 rounded-xl bg-card border border-border">
      <h3 className="text-sm font-medium text-foreground">Timer Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-muted-foreground">Focus Duration</Label>
            <span className="text-sm font-medium text-focus">{focusDuration} min</span>
          </div>
          <Slider
            value={[focusDuration]}
            onValueChange={([v]) => onFocusChange(v)}
            min={5}
            max={60}
            step={5}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-muted-foreground">Break Duration</Label>
            <span className="text-sm font-medium text-break">{breakDuration} min</span>
          </div>
          <Slider
            value={[breakDuration]}
            onValueChange={([v]) => onBreakChange(v)}
            min={1}
            max={30}
            step={1}
            className="py-2"
          />
        </div>
      </div>
    </div>
  );
}
