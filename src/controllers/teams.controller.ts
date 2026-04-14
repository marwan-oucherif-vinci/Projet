import { Request,Response, Router } from "express";
import { LoggerService } from "../services/logger.service";
import { TeamsService } from "../services/teams.service";
import { NewTeamDTO, Team, TeamShortDTO } from "../models/team.model";
import { TeamsMapper } from "../mappers/teams.mapper";
import { isNewTeamDTO } from "../utils/guards";


export const teamsController = Router();

teamsController.get('/',(req:Request,res:Response)=>{
    LoggerService.info("[GET] /teams/");
    const teams = TeamsService.getAll();
    const teamsDTO : TeamShortDTO [] = []
for (let i = 0; i < teams.length; i++) {
    teamsDTO.push(TeamsMapper.toShortDTO(teams[i]))
    
}
return res.status(200).json(teamsDTO);
})

teamsController.post('/',(req:Request,res:Response)=>{
    LoggerService.info("[POST] /teams/")
    const teamDTO : NewTeamDTO = req.body;

    if(!isNewTeamDTO(teamDTO)){
        LoggerService.error("Invalid or missing fields");
        return res.status(400).send();
    }

    const team : Team | undefined = TeamsService.create(TeamsMapper.fromNewTeamDTO(teamDTO));
    if(!team){
        LoggerService.error("User not created")
        return res.status(500).send();
    }
    LoggerService.info("Team created")
    return res.status(201).json(TeamsMapper.toDTO(team))
})

teamsController.get('/:id',(req:Request,res:Response)=>{
    LoggerService.info("[GET] /teams/:id");
    const id = Number(req.params.id);

    if(isNaN(id)) {
        LoggerService.error("Not a valid number")
        return res.status(400).json({error : `Invalid team id : ${req.params.id}  `})
    }
    const team = TeamsService.getById(id);
    if(!team) {
        LoggerService.error("Team not found")
        return res.status(404).json({error : `Team with id ${id} not found`})
    }
    return res.status(200).json(TeamsMapper.toDTO(team))
})

teamsController.put('/:id',(req:Request,res:Response)=>{
    LoggerService.info("[PUT] /teams/:id");
    const id = Number(req.params.id);
    const team = req.body

    if(isNaN(id)) {
        LoggerService.error("Not a valid number")
        return res.status(400).json({error : `Invalid id : ${req.params.id}  `})
    }

    if(id !== team.id){
        LoggerService.error("ID mismatch between URL and Body");
        return res.status(400).json({error : "Invalid payload or ID mismatch "})
    }
    const result = TeamsService.update(TeamsMapper.fromDTO(team))

    if(!result){
        LoggerService.error("Team not found");
        return res.status(404).json({error : `Team with id ${id} not found`})
    }
    return res.status(200).json(TeamsMapper.toDTO(result));
})

// quand je renvoie j'ai la meme description que ma requete mais dans le swagger c pas la meme

teamsController.patch('/:id/join',(req:Request,res:Response)=>{
    LoggerService.info("[PATCH] /teams/:id/join")
    const teamId = Number(req.params.id);

     if(isNaN(teamId)) {
        LoggerService.error("Not a valid number")
        return res.status(400).json({error : `Invalid team id : ${req.params.id}  `})
    }

    const userId = 1 // faudra changer ça avec le auth, la je brut code 
    const result = TeamsService.joinTeam(teamId,userId);

    
    if(result === "ALREADY_IN"){
        LoggerService.error("User is already in the team");
        return res.status(400).json({error: `User ${userId} is already in the team ${teamId}`})
    }
    
   if(!result){
        LoggerService.error("Team not found");
        return res.status(404).json({error : `Team with id ${teamId} not found`})
    }
    return res.status(200).json(TeamsMapper.toDTO(result))
})

teamsController.patch('/:id/leave',(req:Request,res:Response)=>{
    LoggerService.info("[PATCH] /teams/:id/leave")
    const teamId = Number(req.params.id);

     if(isNaN(teamId)) {
        LoggerService.error("Not a valid number")
        return res.status(400).json({error : `Invalid team id : ${req.params.id}  `})
    }
    const userId = 1;
    const result = TeamsService.leaveTeam(teamId,userId);

    if(!result){
        LoggerService.error("Team not found or user not in team");
        return res.status(404).json({error : `Team ${teamId} not found or user ${userId} is not in this team`})
    }

    return res.status(200).json(TeamsMapper.toDTO(result))


})



