import  { Router,Response,Request } from "express";
import { LoggerService } from "../services/logger.service";
import { GamesService } from "../services/games.service";
import { EGameStatus, Game, GameDTO, GameShortDTO, NewGameDTO } from "../models/game.model";
import { GamesMapper } from "../mappers/games.mapper";
import {  isGameDTO, isNewGameDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthenficatedRequest } from "../models/auth.model";
import { Erole } from "../models/user.models";
import { error, log } from "node:console";


export const gamesController = Router();

gamesController.get('/',(req:Request,res:Response)=>{
    LoggerService.info("[GET] /games/")
    const games = GamesService.getAll();
    const gamesDTO : GameShortDTO [] = [];
    const today = new Date();

    for (let i = 0; i < games.length; i++) {
        const gameDate = games[i].scheduledDate
        if(!gameDate){
        gamesDTO.push(GamesMapper.toShortDTO(games[i]))
        }
        else if(new Date(gameDate) >= today){
            gamesDTO.push(GamesMapper.toShortDTO(games[i]))
        }
    
    }
    return res.status(200).json(gamesDTO);
})

gamesController.post('/',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[POST] /games");
    const gameDTO : NewGameDTO = req.body;
    const loggedInUser = req.user;

  if(loggedInUser?.role !== Erole.REFEREE){
        LoggerService.error("Authenticated user is not a referee")
        return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not a referee`})
    }

    if(!isNewGameDTO(gameDTO)){
        LoggerService.error("Invalid or missing fields")
        return res.status(400).send();
    }
  
    const refereeId = loggedInUser.id
    const game : Game | undefined | string = GamesService.create(GamesMapper.fromNewGameDTO(gameDTO),refereeId) 
    
    if(game === "Same Team"){
        LoggerService.error("Team can't play again itself")
        return res.status(400).json({error : `Team with id ${gameDTO.awayTeamId} can't play again itself `})
    }
    if(game === "Sport Mismatch"){
        LoggerService.error("Teams have not the same sport")
        return res.status(400).json({error : `Home team with id ${gameDTO.homeTeamId} have not the same sport as away team with id ${gameDTO.awayTeamId} `})
    }
    if(game=== "Field Already Booked"){
        LoggerService.error("The field is already booked at this date")
        return res.status(400).json({error : `Field : '${gameDTO.fieldId}' is already booked at this date`})
    }

    if(!game){
        LoggerService.error("Game not created ")
        return res.status(500).json({error : `Game not created`}); 
    }
    
    return res.status(201).json(GamesMapper.toDTO(game as Game))

})


gamesController.get('/:id',(req:Request,res:Response)=>{
    LoggerService.info("[GET] /games/id")
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

gamesController.put('/:id',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[PUT] /games/");
    const id = Number(req.params.id);
    const gameDTO : GameDTO = req.body;
    const loggedInUser = req.user;

    if(loggedInUser?.role !== Erole.REFEREE){
           LoggerService.error("Authenticated user is not a referee")
        return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not a referee`})
    }
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
      return res.status(404).json({error : `Cannot update game with ${id}`})    
    }

    return res.status(200).json(GamesMapper.toDTO(gameUpdated));


})


gamesController.delete("/:id",AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[DELETE] /games/:id")
    const id = Number(req.params.id);
    const loggedInUser = req.user;

    if(loggedInUser?.role !== Erole.ADMIN){
           LoggerService.error("Authenticated user is not an admin")
        return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not an admin`})
    }
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


gamesController.patch("/:id/score/:homeScore/:awayScore",AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[PATCH] /games/:id/score/homeScore/awayScore");
    const id = Number(req.params.id);
    const homeScore = Number(req.params.homeScore);
    const awayScore = Number(req.params.awayScore);
    const loggedInUser = req.user;
    
    if(loggedInUser?.role !== Erole.REFEREE){
           LoggerService.error("Authenticated user is not a referee")
        return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not a referee`})
    }

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
})

gamesController.patch("/:id/status/:status",AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[PATCH] /games/:id/status/:status");
    const id = Number(req.params.id);       
    const status : EGameStatus = req.params.status as EGameStatus 
    const loggedInUser = req.user;

    if(loggedInUser?.role === Erole.PLAYER){
           LoggerService.error("Authenticated user is not a referee, trainer or admin")
        return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not a referee, trainer or admin`})
    }
    
    const gameUpdated = GamesService.updateGameStatus(id,status)
    if(!gameUpdated){
        LoggerService.error("Invalid or disallowed status transition, or missing prerequisites for starting")
        return res.status(400).json({error : `Invalid or disallowed status transition, or missing prerequisites for starting`})
    }
    return res.status(200).json(GamesMapper.toDTO(gameUpdated))
})
