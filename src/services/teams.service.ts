import e from "express";
import { TeamsMapper } from "../mappers/teams.mapper";
import { NewTeam, NewTeamDTO, Team, TeamDBO } from "../models/team.model";
import { User } from "../models/user.models";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class TeamsService {
     private static dbPath = './data/teams.json'


     private static readTeamsDB() : Team[]{
        let dbos : TeamDBO [] = [];
        try{
            dbos = FilesService.readFile<TeamDBO>(this.dbPath) 
        } catch (error){
            LoggerService.error("Error reading .json: " + error);
            return [];
    }
    const items : Team [] = [];
    for(const dbo of dbos){
        items.push(TeamsMapper.fromDBO(dbo));
    }

     return items;   
    }


    
    static getAll(): Team[]{
            return this.readTeamsDB();
        }
    

         private static writeTeamsDB(teams: Team[]) : boolean {
                let dbos : TeamDBO [] = [];
        
            for(const team of teams){
                dbos.push(TeamsMapper.toDBO(team));
            }
            
                try{
                    FilesService.writeFile<TeamDBO>(this.dbPath,dbos) 
                    return true;
                } catch (error){
                    LoggerService.error("Error writing teams.json: " + error);
                    return false;
            }
        
        }

    static create(team:NewTeam) : Team | undefined {
        const teamsDB : Team [] = this.readTeamsDB();

        const newTeam : Team = {
            id : teamsDB.length + 1,
            players :  [],
            trainerId : 1,
            name : team.name,
            description : team.description,
            sportType : team.sportType,
            createdAt : new Date(),
            updatedAt : new Date(),
            

        }
        teamsDB.push(newTeam);

        if(!TeamsService.writeTeamsDB(teamsDB)){
            return undefined;
        }
        return newTeam;
    }
    

    public static getById(id:number) : Team | undefined {
        const teams : Team [] = TeamsService.readTeamsDB();

        for (const team of teams) {
           if (team.id === id){
            return team;
           }
            
        }
        return undefined;
    } 
    
    public static update (updatedTeam : Team ) : Team | undefined {
        const teams : Team[] = TeamsService.readTeamsDB();
        let index = -1;
        for (let i = 0; i < teams.length; i++) {
            if(teams[i].id === updatedTeam.id){
                index = i;
                break;
            }
            
        }
        if (index === -1) return undefined;

        updatedTeam.createdAt = teams[index].createdAt;
        updatedTeam.updatedAt = new Date();

        teams[index] = updatedTeam;
        
        if (!TeamsService.writeTeamsDB(teams)){
            return undefined;
        }
        return updatedTeam;


    }

    public static joinTeam (teamId : number, userId : number ) : Team | undefined | "ALREADY_IN" {
        const teams : Team [] = TeamsService.readTeamsDB();

        let index = -1;
        for (let i = 0; i < teams.length; i++) {
            if(teamId === teams[i].id){
                index = i;
            }
        }
        if(index === -1)return undefined;

        let isAlreadyIn = false;
        for (const playerId of teams[index].players) {
           if(playerId === userId) {
            isAlreadyIn = true;
            break;            
        }
    }
    if(isAlreadyIn){
        return "ALREADY_IN";
    }
    teams[index].players.push(userId);
    teams[index].updatedAt = new Date();

    if(!TeamsService.writeTeamsDB(teams)){
        return undefined;
    }
          return teams[index];
}


public static leaveTeam(teamId : number, userId : number) : Team | undefined {
    const teams : Team[] = TeamsService.readTeamsDB();

    let index = -1;
    for (let i = 0; i < teams.length; i++) {
        if(teams[i].id === teamId){
            index = i;
            break;
        }
    }
    if (index === -1) return undefined;

    let playerPosition = -1;
    

    for (let i = 0; i < teams[index].players.length; i++) {
        if(userId === teams[index].players[i]){
            playerPosition = i;
            break;
        }  
    }
    if(playerPosition === -1){
        return undefined;
    }
    teams[index].players.splice(playerPosition,1)
    teams[index].updatedAt = new Date();

    if(!TeamsService.writeTeamsDB(teams)){
        return undefined;
    }
    return teams[index];
}
}
   