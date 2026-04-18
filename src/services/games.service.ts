import { GamesMapper } from "../mappers/games.mapper";
import { TeamsMapper } from "../mappers/teams.mapper";
import { EGameStatus, Game, GameDBO, GameShortDTO, NewGame } from "../models/game.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class GamesService {
    private static dbPath = './data/games.json'

    private static readGamesDB() : Game [] {
         let dbos : GameDBO [] = [];
                try{
                    dbos = FilesService.readFile<GameDBO>(this.dbPath) 
                } catch (error){
                    LoggerService.error("Error reading .json: " + error);
                    return [];
            }
            const items : Game [] = [];
            for(const dbo of dbos){
                items.push(GamesMapper.fromDBO(dbo));
            }
        
             return items;   
            }
        

    

    public static getAll(): Game[]{
        return this.readGamesDB();

    }
    public static writeGamesDB(games : Game []) : boolean {
        let dbos : GameDBO [] = [];

        for (const game of games) {
          dbos.push(GamesMapper.toDBO(game))
        }

        try {
            FilesService.writeFile<GameDBO>(this.dbPath,dbos);
            return true;
        } catch (error) {
            LoggerService.error("Error writing games.json" + error)
            return false;
            
        }
    } 


    public static create (game : NewGame) : Game | undefined {
        const gamesDB : Game [] = this.readGamesDB();
        
        let initialStatus = EGameStatus.CREATED
        if (game.fieldId && game.scheduledDate){
            initialStatus = EGameStatus.SCHEDULDED;
        }

        const newGame : Game = {
            id : gamesDB.length + 1,
            status : initialStatus,
            name : game.name,
            fieldId : game.fieldId, 
            refereeId : game.refereeId,
            homeTeamId : game.homeTeamId,
            awayTeamId : game.awayTeamId,
            scheduledDate : game.scheduledDate,
            homeScore : 0,
            awayScore : 0,
            createdAt : new Date(),
            updatedAt : new Date()


        }
        gamesDB.push(newGame)
        if(!this.writeGamesDB(gamesDB)){
            return undefined;
        }
        return newGame;

    }


    public static getById(gameId : Number) : Game | undefined {
        const gamedDB = this.readGamesDB();

        for (let i = 0; i < gamedDB.length; i++) {
            if(gamedDB[i].id === gameId){
                return gamedDB[i]
            }
            
        }
        return undefined;

       
    }
}
