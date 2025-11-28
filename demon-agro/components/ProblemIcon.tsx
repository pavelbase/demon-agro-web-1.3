import { FlaskConical } from "lucide-react";

interface ProblemIconProps {
  type: "ph" | "s" | "k" | "mg" | "lab";
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ProblemIcon({ type, size = "md" }: ProblemIconProps) {
  const sizes = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-32 h-32 text-5xl",
  };

  const colors = {
    ph: "bg-[#4A7C59]",
    s: "bg-[#F59E0B]",
    k: "bg-[#3B82F6]",
    mg: "bg-[#8B5CF6]",
    lab: "bg-[#5C4033]",
  };

  const labels = {
    ph: "pH",
    s: "S",
    k: "K",
    mg: "Mg",
    lab: null,
  };

  return (
    <div
      className={`${sizes[size]} ${colors[type]} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300`}
    >
      {type === "lab" ? (
        <FlaskConical className="w-1/2 h-1/2 text-white" />
      ) : (
        <span className="text-white font-bold">{labels[type]}</span>
      )}
    </div>
  );
}
