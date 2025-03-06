interface StatBlockProps {
    label: string;
    value: number;
  }
  
  export function StatBlock({ label, value }: StatBlockProps) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-white">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    );
  }