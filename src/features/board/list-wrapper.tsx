import React from "react";

interface ListWrapperProps {
  children: React.ReactNode;
}

export const ListWrapper = ({ children }: ListWrapperProps) => {
  return (
    <li className="shrink-0 w-80 h-full select-none">
      {children}
    </li>
  );
};
