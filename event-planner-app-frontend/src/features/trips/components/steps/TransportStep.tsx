import { Footprints } from "lucide-react";
import { ToggleButton } from "../../../../components";
import { TRANSPORTS, TRANSPORT_LABELS } from "../../constants";
import Label from "./Label";
import type { FieldGroupProps } from "./fieldTypes";
import { useWatch } from "react-hook-form";

export default function TransportStep({ control, setValue }: FieldGroupProps) {
  const transport = useWatch({ name: "transport", control });

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
