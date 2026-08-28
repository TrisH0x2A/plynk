import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { defaultImages } from "@/constants/images";

interface FormPickerProps {
  id: string;
}

export const FormPicker = ({ id }: FormPickerProps) => {
  const [selectedImageId, setSelectedImageId] = useState<string>(
    defaultImages[0].id
  );

  return (
    <div className="relative">
      <p className="font-mono text-[11px] uppercase font-semibold text-[#71717A] dark:text-[#656467] tracking-wider mb-2">
        Monochrome Board Themes
      </p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {defaultImages.map((img) => {
          const isSelected = selectedImageId === img.id;
          return (
            <div
              key={img.id}
              className={cn(
                "cursor-pointer relative aspect-video group transition border rounded-none overflow-hidden select-none",
                img.className,
                isSelected
                  ? "border-black dark:border-white ring-2 ring-black dark:ring-white"
                  : "border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA]"
              )}
              onClick={() => setSelectedImageId(img.id)}
            >
              <input
                type="radio"
                id={id}
                name={id}
                className="hidden"
                checked={isSelected}
                onChange={() => {}}
                value={`${img.id}|${img.className}|${img.className}|SYS_ADMIN|`}
              />
              {isSelected && (
                <div className="absolute inset-y-0 h-full w-full bg-black/40 flex items-center justify-center pointer-events-none">
                  <Check
                    className="h-4 w-4"
                    style={{ color: "#ffffff", stroke: "#ffffff" }}
                  />
                </div>
              )}
              <div
                className="absolute bottom-0 w-full text-[8.5px] font-mono uppercase tracking-wider truncate p-0.5 px-1 font-semibold pointer-events-none text-center"
                style={{
                  color: "#ffffff",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                }}
              >
                {img.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
