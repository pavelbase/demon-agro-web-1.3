interface StepNumberProps {
  number: number;
}

export default function StepNumber({ number }: StepNumberProps) {
  return (
    <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-2xl">
        {number.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
