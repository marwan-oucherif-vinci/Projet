import { TeamsMapper } from "../mappers/teams.mapper";
import { NewTeam, Team, TeamDBO } from "../models/team.model";
import { User } from "../models/user.models";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class TeamsService {
     private static dbPath = './data/teams.json'
     private static readUsersDB() : Team[]{
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
            return this.readUsersDB();
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
        const teamsDB : Team [] = this.readUsersDB();

        const newTeam : Team = {
            id : teamsDB.length + 1,
            players :  [],
            trainerId : 0,
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
    }

   