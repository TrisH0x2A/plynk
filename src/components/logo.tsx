import React from "react";

interface LogoProps {
  onClick?: () => void;
}

export const Logo = ({ onClick }: LogoProps) => {
  return (
    <div
      onClick={onClick}
      className="hover:opacity-75 transition items-center gap-x-2 hidden md:flex cursor-pointer"
    >
      <img
        src="/logo.png"
        alt="Plynk Logo"
        height={28}
        width={28}
        className="rounded-md object-contain"
      />
      <p className="text-lg text-neutral-700 pb-0.5 font-bold tracking-wide">
        Plynk
      </p>
    </div>
  );
};
