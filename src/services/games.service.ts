import { GamesMapper } from "../mappers/games.mapper";
import { TeamsMapper } from "../mappers/teams.mapper";
import { Game, GameDBO, GameShortDTO } from "../models/game.model";
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
}
