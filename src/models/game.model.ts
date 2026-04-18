export interface Game {
    id : number,
    status : EGameStatus,
    name? : string,
    fieldId?: number,
    refereeId? : number,
    homeTeamId? : number,
    awayTeamId? : number,
    homeScore? : number,
    awayScore? :  number,
    scheduledDate? : string,
    createdAt? : Date,
    updatedAt? : Date
}

export interface GameDTO {
     id : number,
    status : EGameStatus,
    name? : string,
    fieldId?: number,
    refereeId? : number,
    homeTeamId? : number,
    awayTeamId? : number,
    homeScore? : number,
    awayScore? :  number,
    scheduledDate? : string,
    createdAt? : string,
    updatedAt? : string
}

export interface GameShortDTO {
    id : number,
    status : EGameStatus,
    name? : string,
    fieldId?: number,
    homeTeamId? : number,
    awayTeamId? : number,
    scheduledDate? : string,
}

export enum EGameStatus {
    CREATED = 'created',
    SCHEDULDED = 'schedulded',
    STARTED = 'started',
    FINISHED = 'finished',
    CANCELLED = 'cancelled'
}

export interface GameDBO {
     id : number,
    status : EGameStatus,
    name? : string,
    field_id?: number,
    referee_id? : number,
    home_team_id? : number,
    away_team_id? : number,
    home_score? : number,
    away_score? :  number,
    scheduled_date? : string,
    created_at : string,
    updated_at : string
    
}

export interface NewGameDTO {
    name : string,
    fieldId : number,
    refereeId : number, 
    homeTeamId : number,
    awayTeamId : number,
    scheduledDate : string
}


export interface NewGame {
     name? : string,
    fieldId? : number,
    refereeId? : number, 
    homeTeamId? : number,
    awayTeamId? : number,
    scheduledDate? : string
}
