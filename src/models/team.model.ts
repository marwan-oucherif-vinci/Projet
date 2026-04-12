import { exitCode } from "node:process"

export interface Team {
    id: number,
    name : string,
    description? : string,
    sportType : ESportType,
    players : number [], 
    trainerId : number,
    createdAt : Date,
    updatedAt : Date
}

export interface TeamDBO {
    id: number,
    name : string,
    description? : string,
    sport_type : ESportType,
    players : number[],
    trainer_id : number,
    created_at : string,
    updated_at : string

}


export enum ESportType {
    FOOTBALL = 'football',
    BASKETBALL = 'basketball',
    TENNIS = 'tennis',
    VOLLEYBALL = 'voleyball',
    HOCKEY = 'hockey'
}


export interface TeamShortDTO {
    id : number,
    name : string,
    sportType : ESportType
}

export interface NewTeamDTO {
    name : string,
    description? : string,
    sportType : ESportType
}
export interface NewTeam {
    name : string,
    description? : string,
    sportType : ESportType
}

export interface TeamDTO {
    id: number,
    name : string,
    description? : string,
    sportType : ESportType,
    players : number[],
    trainerId : number,
    createdAt : Date,
    updatedAt : Date
}
