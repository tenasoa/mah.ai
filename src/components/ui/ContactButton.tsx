"use client";

import { ReactNode } from "react";

interface ContactButtonProps {
  children: ReactNode;
  className?: string;
}

export function ContactButton({ children, className = "" }: ContactButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-contact'));
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}
