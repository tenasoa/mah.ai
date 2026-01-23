"use client";

import { ReactNode } from "react";
// Types kept for compatibility if needed elsewhere, though unused here
export interface SerializableNavItem {
  href: string;
  label: string;
  iconKey: string;
  badge?: string | number;
}

interface SubjectsPageWrapperProps {
  navItems: SerializableNavItem[];
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function SubjectsPageWrapper({
  children,
}: SubjectsPageWrapperProps) {
  // Layout is handled by PersistentLayout globally now.
  // This wrapper is kept for API compatibility with existing page structure.
  return <>{children}</>;
}
