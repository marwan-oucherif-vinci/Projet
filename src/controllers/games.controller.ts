import e, { Router,Response,Request } from "express";
import { LoggerService } from "../services/logger.service";
import { GamesService } from "../services/games.service";
import { Game, GameDTO, GameShortDTO, NewGameDTO } from "../models/game.model";
import { GamesMapper } from "../mappers/games.mapper";
import { isNewGameDTO } from "../utils/guards";
import { error } from "node:console";

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
    const gameDTO : NewGameDTO = req.body;

    if(!isNewGameDTO(gameDTO)){
        LoggerService.error("Invalid or missing fields")
        return res.status(400).send();
    }
    const game : Game | undefined = GamesService.create(GamesMapper.fromNewGameDTO(gameDTO)) 

    if(!game){
        LoggerService.error("Game not created ")
        return res.status(500).json({error : `Game not created`}); // on send rien dans les post ?
    }
    
    return res.status(201).json(GamesMapper.toDTO(game))

})


gamesController.get('/:id',(req:Request,res:Response)=>{
    LoggerService.error("[GET] /games/id")
    const id = Number(req.params.id);

    if(isNaN(id)){
        LoggerService.error("Invalid id")
        return res.status(400).json({error : `Id ${req.params.id} is not a valid number`})
    }

    const game : Game | undefined = GamesService.getById(id)

    if(!game){
        LoggerService.error("Game not found")
        return res.status(404).json({error : `Game with id ${id} not found`})
    }

    return res.status(200).json(game);

    
})

