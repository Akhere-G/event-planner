import { Footprints } from "lucide-react";
import { ToggleButton } from "../../../../components";
import { TRANSPORTS, TRANSPORT_LABELS } from "../../constants";
import Label from "./Label";
import type { FieldGroupProps } from "./fieldTypes";

export default function TransportStep({ watch, setValue }: FieldGroupProps) {
  const transport = watch("transport");
  return (
    <div className="flex flex-col gap-2">
      <Label>Getting around</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TRANSPORTS.map((option) => (
          <ToggleButton
            key={option}
            label={TRANSPORT_LABELS[option]}
            value={option}
            isSelected={transport === option}
            icon={Footprints}
            onClick={() =>
              setValue("transport", transport === option ? null : option)
            }
          />
        ))}
      </div>
    </div>
  );
}
