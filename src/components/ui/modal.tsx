import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          "w-full max-w-md bg-surface border border-border rounded-lg shadow-lg flex flex-col max-h-[90vh]",
          className
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading text-lg font-bold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-neutral"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
