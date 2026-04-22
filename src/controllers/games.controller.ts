import e, { Router,Response,Request } from "express";
import { LoggerService } from "../services/logger.service";
import { GamesService } from "../services/games.service";
import { EGameStatus, Game, GameDTO, GameShortDTO, NewGameDTO } from "../models/game.model";
import { GamesMapper } from "../mappers/games.mapper";
import { isGameDTO, isNewGameDTO } from "../utils/guards";
import { error } from "node:console";
import { request } from "node:http";

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

gamesController.put('/:id',(req:Request,res:Response)=>{
    LoggerService.info("[PUT] /games/");
    const id = Number(req.params.id);
    const gameDTO : GameDTO = req.body;

    if(isNaN(id)){
     LoggerService.error("Invalid id")
     return res.status(400).json({error : `Id ${req.params.id} is not a valid number`})    
    }

    if(id!== gameDTO.id){
        LoggerService.error("Body and path ID mismatch")
        return res.status(400).json({error: `Body and path ID ${req.params.id} mismatch`})
    }

    if(!isGameDTO(gameDTO)){
        LoggerService.error("Invalid payload")
        return res.status(400).json({error : `Invalid payload `})
    }

    const gameUpdated : Game | undefined = GamesService.update(GamesMapper.fromDTO(gameDTO))
   
    if(gameUpdated === undefined){
      LoggerService.error("Game not found");
      return res.status(404).json({error : `Game with id ${id} not found`})    
    }

    return res.status(200).json(GamesMapper.toDTO(gameUpdated));
        // mes test http ne fonctionnent pas bien je crois 


})


gamesController.delete("/:id",(req:Request,res:Response)=>{
    LoggerService.info("[DELETE] /games/:id")
    const id = Number(req.params.id);

   if(isNaN(id)){
     LoggerService.error("Invalid id")
     return res.status(400).json({error : `Id ${req.params.id} is not a valid number`})    
    }

    const result = GamesService.delete(id);
    
    if(!result){
        LoggerService.error("Failed to delete the game");
        return res.status(500).json({error : `Failed to delete game with id ${id}`})
    }
    return res.status(204).send();

})


gamesController.patch("/:id/score/:homeScore/:awayScore",(req:Request,res:Response)=>{
    LoggerService.info("[PATCH] /games/:id/score/homeScore/awayScore");
    const id = Number(req.params.id);
    const homeScore = Number(req.params.homeScore);
    const awayScore = Number(req.params.awayScore);

    if(isNaN(homeScore) || isNaN (awayScore)){
        LoggerService.error("Invalid score value");
        return res.status(400).json({error : `home score "${req.params.home}" or away score "${req.params.awayScore}" are invalid`})
    }
    const result = GamesService.updateScore(id,homeScore,awayScore);

    if(!result){
        LoggerService.error("Game not found, not in started status")
        return res.status(400).json({error: `Game with id ${id} not found or not in started status`})
    }
    return res.status(200).json(GamesMapper.toDTO(result));
// pq dans le swagger il renvoie un created dans le schema alors que ça fonctionne que quand c'est en started 
})

gamesController.patch("/:id/status/:status",(req:Request,res:Response)=>{
    LoggerService.info("[PATCH] /games/:id/status/:status");
    const id = Number(req.params.id);
    const status : EGameStatus = req.params.status as EGameStatus; // on a pas vu le as comment on fait alors ? 
    
    const gameUpdated = GamesService.updateGameStatus(id,status)
    if(!gameUpdated){
        LoggerService.error("Invalid or disallowed status transition, or missing prerequisites for starting")
        return res.status(400).json({error : `Invalid or disallowed status transition, or missing prerequisites for starting`})
    }
    return res.status(200).json(GamesMapper.toDTO(gameUpdated))
    // transition d'un etat vers lui meme ça renvoie toute la game ou je dois meme ça annulé et aussi regarder le service pour voir si la manier dont j'ai fais est bonne 
})
