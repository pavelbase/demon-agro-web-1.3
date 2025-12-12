import Link from "next/link";
import ProblemIcon from "./ProblemIcon";

interface ProblemCardProps {
  icon: "ph" | "s" | "k" | "mg" | "lab";
  title: string;
  description: string;
  link: string;
}

export default function ProblemCard({
  icon,
  title,
  description,
  link,
}: ProblemCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <ProblemIcon type={icon} size="lg" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          href={link}
          className="text-[#4A7C59] hover:text-[#3d6449] font-semibold transition-colors inline-flex items-center"
        >
          Zjistit více
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
