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



    public static update(game : Game ) : Game | undefined {
        const gamesDB = this.readGamesDB();
        let index = -1;

       for (let i = 0; i < gamesDB.length; i++) {
       if(gamesDB[i].id === game.id){
        index = i;
        break;
    }
   }
   
   if(index === -1)return undefined;
   
   if (gamesDB[index].status === EGameStatus.FINISHED || gamesDB[index].status === EGameStatus.CANCELLED){
    return undefined;
   }
   if(game.status === EGameStatus.STARTED){
   game.fieldId= gamesDB[index].fieldId;
   game.refereeId = gamesDB[index].refereeId;
   game.homeTeamId = gamesDB[index].homeTeamId;
   game.awayTeamId = gamesDB[index].awayTeamId;
   game.status = EGameStatus.STARTED;
  
 
   }
     game.createdAt = gamesDB[index].createdAt;
    game.updatedAt = new Date(); 
    gamesDB[index] = game;

   if(!GamesService.writeGamesDB(gamesDB)){
    return undefined;
   }
   return game;
}


public static delete (id:Number) : boolean | undefined {
    const gamedDB : Game [] = GamesService.readGamesDB();
    let indx = -1;
    for (let index = 0; index < gamedDB.length; index++) {
       if(id === gamedDB[index].id){
            indx = index;
            break;
       }
        
    }
    if(indx === -1) return undefined;

    gamedDB.splice(indx,1);

    if(!GamesService.writeGamesDB(gamedDB)){
        return false;
    }
    return true;


}

public static updateScore(id:number,homeScore : number, awayScore : number) : Game | undefined{
    const gamesDB = GamesService.readGamesDB();
    let index = -1;
    for (let i = 0; i < gamesDB.length; i++) {
        if(gamesDB[i].id === id){
            index = i;
            break;
        }
    }
    if(index === -1) return undefined;

    if(gamesDB[index].status !== EGameStatus.STARTED) return undefined;
           
    gamesDB[index].homeScore = homeScore;
    gamesDB[index].awayScore = awayScore; 
    gamesDB[index].updatedAt = new Date();
    
    if(!this.readGamesDB){
        return undefined;
    }
    return gamesDB[index];

    
}

public static updateGameStatus(id:number,status : EGameStatus) : Game | undefined{
    const gamesDB = this.readGamesDB();
    let index = -1;
    for (let i = 0; i < gamesDB.length; i++) {
        if(gamesDB[i].id === id){
            index = i;
            break;
        }
    }
    if(index === -1) return undefined;
    
    let isTransitionAllowed = false; 

    if(gamesDB[index].status === EGameStatus.CREATED && status === EGameStatus.CANCELLED){
        isTransitionAllowed = true
    }
    if(gamesDB[index].status === EGameStatus.SCHEDULDED && status === EGameStatus.STARTED){
        if(gamesDB[index].fieldId && gamesDB[index].refereeId && gamesDB[index].homeTeamId && gamesDB[index].awayTeamId && gamesDB[index].homeScore === 0 && gamesDB[index].awayScore === 0){
                isTransitionAllowed = true;
        }

    }
    
    if(gamesDB[index].status === EGameStatus.SCHEDULDED && status === EGameStatus.CANCELLED){
        isTransitionAllowed = true;
    }
    if(gamesDB[index].status === EGameStatus.STARTED && status === EGameStatus.FINISHED){
        isTransitionAllowed = true;
    }

    if(!isTransitionAllowed){
        return undefined;
    }
    gamesDB[index].status = status;
    gamesDB[index].updatedAt = new Date();

    if(!this.writeGamesDB(gamesDB)){
        return undefined;
    }
    return gamesDB[index];
}
}
