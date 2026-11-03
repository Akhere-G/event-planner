import { Users } from "lucide-react";
import { ToggleButton } from "../../../../components";
import { PACES, PACE_LABELS, VIBE_OPTIONS } from "../../constants";
import Label from "./Label";
import { toggleInList, type FieldGroupProps } from "./fieldTypes";

export default function VibeStep({ watch, setValue }: FieldGroupProps) {
  const vibes = watch("vibes") ?? [];
  const pace = watch("pace");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>What vibe are you after? (pick any)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {VIBE_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              label={option.label}
              value={option.value}
              isSelected={vibes.includes(option.value)}
              icon={Users}
              onClick={(value) => setValue("vibes", toggleInList(vibes, value))}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Pace</Label>
        <div className="grid grid-cols-3 gap-2">
          {PACES.map((option) => (
            <ToggleButton
              key={option}
              label={PACE_LABELS[option]}
              value={option}
              isSelected={pace === option}
              icon={Users}
              onClick={() => setValue("pace", pace === option ? null : option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
