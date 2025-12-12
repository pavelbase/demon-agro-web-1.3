import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center shadow-lg mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
