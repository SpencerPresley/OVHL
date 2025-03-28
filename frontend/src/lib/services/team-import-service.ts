import axios from 'axios';
import { NHL_TEAMS } from '../teams/nhl';
import { AHL_TEAMS } from '../teams/ahl';
import { ECHL_TEAMS } from '../teams/echl';
import { CHL_TEAMS } from '../teams/chl';

interface ApiResponse {
    status: string;
    message: string;
    result: {
        status: string;
        nhl_teams: number;
        ahl_teams: number;
        echl_teams: number;
        chl_teams: number;
    };
}

class TeamImportService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }

    public async importTeams(): Promise<ApiResponse> {
        try {
            const nhlTeams = NHL_TEAMS.map(
                team => ({
                    _id: team.id,
                    name: team.name,
                    abbreviation: team.abbreviation,
                    division: team.division,
                    conference: team.conference,
                    logo_path: team.logo_path,
                    colors: {
                        primary: team.colors.primary,
                        secondary: team.colors.secondary,
                    },
                    ahlTeamId: team.ahlTeamId,
                    echlTeamId: team.echlTeamId,
                })
            );

            const ahlTeams = AHL_TEAMS.map(
                team => ({
                    _id: team.id,
                    name: team.name,
                    abbreviation: team.abbreviation,
                    division: team.division,
                    conference: team.conference,
                    logo_path: team.logo_path,
                    colors: {
                        primary: team.colors.primary,
                        secondary: team.colors.secondary,
                    },
                    nhlTeamId: team.nhlTeamId,
                    echlTeamId: team.echlTeamId,
                })
            );

            const echlTeams = ECHL_TEAMS.map(
                team => ({
                    _id: team.id,
                    name: team.name,
                    abbreviation: team.abbreviation,
                    division: team.division,
                    conference: team.conference,
                    logo_path: team.logo_path,
                    colors: {
                        primary: team.colors.primary,
                        secondary: team.colors.secondary,
                    },
                    nhlTeamId: team.nhlTeamId,
                    ahlTeamId: team.ahlTeamId,
                })
            );

            const chlTeams = CHL_TEAMS.map(
                team => ({
                    _id: team.id,
                    name: team.name,
                    abbreviation: team.abbreviation,
                    division: team.division,
                    conference: team.conference,
                    league: team.league,
                    logo_path: team.logo_path,
                    colors: {
                        primary: team.colors.primary,
                        secondary: team.colors.secondary
                    }
                })
            );

        }
    }
}