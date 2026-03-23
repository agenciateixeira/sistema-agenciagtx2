import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "default" && "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80",
        variant === "secondary" && "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
        variant === "success" && "border-transparent bg-green-100 text-green-900 hover:bg-green-100/80",
        variant === "destructive" && "border-transparent bg-red-100 text-red-900 hover:bg-red-100/80",
        variant === "outline" && "text-gray-950",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
