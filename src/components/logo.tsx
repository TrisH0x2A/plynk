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
        className="rounded-none object-contain hidden dark:block"
      />
      <img
        src="/logo-light.png"
        alt="Plynk Logo"
        height={28}
        width={28}
        className="rounded-none object-contain block dark:hidden"
      />
      <p className="text-lg text-[#09090B] dark:text-white pb-0.5 font-bold tracking-wide font-sans">
        Plynk
      </p>
    </div>
  );
};
