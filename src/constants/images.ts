export interface BackgroundOption {
  id: string;
  name: string;
  className: string;
  color: string;
}

export const defaultImages: BackgroundOption[] = [
  {
    id: "mono-obsidian",
    name: "OBSIDIAN",
    className: "bg-gradient-to-br from-[#09090B] via-[#000000] to-[#18181B]",
    color: "#09090B",
  },
  {
    id: "mono-graphite",
    name: "GRAPHITE",
    className: "bg-gradient-to-br from-[#1C1C1F] via-[#121214] to-[#000000]",
    color: "#1C1C1F",
  },
  {
    id: "mono-carbon",
    name: "CARBON",
    className: "bg-gradient-to-br from-[#27272A] via-[#18181B] to-[#09090B]",
    color: "#27272A",
  },
  {
    id: "mono-titanium",
    name: "TITANIUM",
    className: "bg-gradient-to-br from-[#3F3F46] via-[#27272A] to-[#18181B]",
    color: "#3F3F46",
  },
  {
    id: "mono-concrete",
    name: "CONCRETE",
    className: "bg-gradient-to-br from-[#52525B] via-[#27272A] to-[#09090B]",
    color: "#52525B",
  },
  {
    id: "mono-eclipse",
    name: "ECLIPSE",
    className: "bg-gradient-to-b from-[#000000] via-[#18181B] to-[#000000]",
    color: "#000000",
  },
  {
    id: "mono-silver-shadow",
    name: "SILVER SHADOW",
    className: "bg-gradient-to-br from-[#71717A] via-[#3F3F46] to-[#18181B]",
    color: "#71717A",
  },
  {
    id: "mono-matrix",
    name: "MATRIX MONO",
    className: "bg-gradient-to-tr from-[#131315] via-[#27272A] to-[#18181B]",
    color: "#131315",
  },
  {
    id: "mono-ash",
    name: "ASH NOIR",
    className: "bg-gradient-to-bl from-[#2A2A2D] via-[#1A1A1C] to-[#09090B]",
    color: "#2A2A2D",
  },
];
