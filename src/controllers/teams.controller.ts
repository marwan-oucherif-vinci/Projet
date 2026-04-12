import { Request,Response, Router } from "express";
import { LoggerService } from "../services/logger.service";
import { TeamsService } from "../services/teams.service";
import { NewTeamDTO, Team, TeamShortDTO } from "../models/team.model";
import { TeamsMapper } from "../mappers/teams.mapper";
import { isNewTeamDTO } from "../utils/guards";
import { UsersService } from "../services/users.service";
import { UsersMapper } from "../mappers/users.mapper";

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



