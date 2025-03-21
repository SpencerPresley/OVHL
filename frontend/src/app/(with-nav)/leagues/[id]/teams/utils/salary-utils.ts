import { TeamSeason } from '../types/team-season';

interface SalaryInfo {
  totalSalary: number;
  salaryCap: number;
  salaryColor: string;
}

export function calculateTeamSalary(teamSeason: TeamSeason): SalaryInfo {
  const totalSalary = teamSeason.players.reduce(
    (total, player) => total + player.playerSeason.contract.amount,
    0
  );

  const salaryCap = teamSeason.tier?.salaryCap ?? 0;

  let salaryColor = 'text-green-500';
  if (totalSalary > salaryCap) {
    salaryColor = 'text-red-500';
  } else if (totalSalary === salaryCap) {
    salaryColor = 'text-white';
  }

  return { totalSalary, salaryCap, salaryColor };
}

export function calculateTeamSalaryFromValues(totalSalary: number, salaryCap: number): SalaryInfo {
  let salaryColor = 'text-green-500';
  if (totalSalary > salaryCap) {
    salaryColor = 'text-red-500';
  } else if (totalSalary === salaryCap) {
    salaryColor = 'text-white';
  }

  return { totalSalary, salaryCap, salaryColor };
}
