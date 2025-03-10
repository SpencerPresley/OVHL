import Image from 'next/image';

interface TeamBannerProps {
  league: {
    logo: string;
    name: string;
    bannerColor: string;
  };
  teamName: string;
  record: string;
  points: number;
  totalSalary: number;
  salaryCap: number;
  salaryColor: string;
}

export function TeamBanner({
  league,
  teamName,
  record,
  points,
  totalSalary,
  salaryCap,
  salaryColor,
}: TeamBannerProps) {
  return (
    <div className={`w-full ${league.bannerColor} py-8`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Image
            src={league.logo}
            alt={`${league.name} Logo`}
            width={80}
            height={80}
            className="object-contain"
          />
          <div>
            <h1 className="text-4xl font-bold text-white">{teamName}</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-xl text-white/80">
                Record: {record} ({points} pts)
              </p>
              <p className={`text-xl ${salaryColor}`}>
                Salary: ${totalSalary.toLocaleString()} / ${salaryCap.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
