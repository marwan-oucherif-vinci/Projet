import { Router,Response,Request } from "express";
import { LoggerService } from "../services/logger.service";
import { GamesService } from "../services/games.service";
import { Game, GameShortDTO } from "../models/game.model";
import { GamesMapper } from "../mappers/games.mapper";

export const gamesController = Router();

gamesController.get('/',(req:Request,res:Response)=>{
    LoggerService.info("[GET] /games/")
    const games = GamesService.getAll();
    const gamesDTO : GameShortDTO [] = [];
    for (let i = 0; i < games.length; i++) {
        gamesDTO.push(GamesMapper.toShortDTO(games[i]))
    
    }
    return res.status(200).json(gamesDTO);
})

gamesController.post('/',(req:Request,res:Response)=>{
    LoggerService.info("[POST] /games");
    const 
})


