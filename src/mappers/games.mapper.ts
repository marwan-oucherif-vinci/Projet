import { Game, GameDBO, GameShortDTO } from "../models/game.model";


export class GamesMapper {
    static fromDBO(dbo:GameDBO): Game {
        return {
            id : dbo.id,
            status : dbo.status,
            name : dbo.name,
            fieldId : dbo.field_id,
            refereeId : dbo.referee_id,
            homeTeamId : dbo.home_team_id,
            awayTeamId : dbo.away_team_id,
            homeScore : dbo.home_score,
            awayScore : dbo.away_score,
            scheduledDate : dbo.scheduled_date,
            createdAt : new Date(dbo.created_at),
            updatedAt : new Date(dbo.updated_at),




        }
    }

    static toShortDTO(game :Game ) : GameShortDTO {
        return {
        id : game.id,
        status : game.status,
        name : game.name,
        fieldId : game.fieldId,
        homeTeamId : game.homeTeamId,
        awayTeamId : game.awayTeamId,
        scheduledDate : game.scheduledDate,
         }
    }
}