import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "terracotta" | "wine" | "sage" | "outline" | "brass";
  className?: string;
}

const variants = {
  default: "bg-linen text-slate border border-sand",
  terracotta: "bg-terracotta-pale text-terracotta border border-terracotta/20",
  wine: "bg-wine-pale text-wine border border-wine/20",
  sage: "bg-sage-pale text-sage border border-sage/25",
  brass: "bg-brass-pale text-brass border border-brass/25",
  outline: "border border-sand text-mist bg-transparent",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-[3px] text-xs font-medium tracking-wide",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
