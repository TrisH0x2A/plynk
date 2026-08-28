import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

export const ToolButton = ({
  label,
  icon: Icon,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) => {
  return (
    <button
      type="button"
      title={label}
      disabled={isDisabled}
      onClick={onClick}
      className={`p-2.5 transition-colors rounded-none flex items-center justify-center cursor-pointer ${
        isActive
          ? "bg-black text-white dark:bg-white dark:text-black font-bold"
          : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B] bg-transparent"
      } ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};
