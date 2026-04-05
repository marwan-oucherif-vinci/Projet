import { error } from "node:console";
import { Erole, EUserStatus, NewUser, NewUserDTO, User, UserDBO } from "../models/user.models";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersMapper } from "../mappers/users.mapper";
import bcrypt from "bcrypt";

export class UsersService {
     private static dbPath = './data/users.json'


    private static readUsersDB() : User[]{
        let dbos : UserDBO [] = [];
        try{
            dbos = FilesService.readFile<UserDBO>(this.dbPath) 
        } catch (error){
            LoggerService.error("Error reading users.json: " + error);
            return [];
    }
    const items : User[] = [];
    for(const dbo of dbos){
        items.push(UsersMapper.fromDBO(dbo));
    }
     return items;   
    }

    
    private static wrieUsersDB(users: User[]) {
        let dbos : UserDBO [] = [];

    for(const user of users){
        dbos.push(UsersMapper.(toDBO.user));
    }
    
        try{
            FilesService.writeFile<UserDBO>(this.dbPath,dbos) 
        } catch (error){
            LoggerService.error("Error reading users.json: " + error);
            return [];
    }
}







    static getAll(): User[]{
        return this.readUsersDB();
    }


    // the user : NewUser is like NewUserDtO, just we have some rules to respect (tasks are split), but in the logic, the have the same attribut and roles
    static create (user : NewUser) : User | undefined {
        const usersDB : User [] = this.readUsersDB(); 
        const password = bcrypt.hashSync(user.password,10);
        const newUser : User = {
            id : usersDB.length + 1,
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            username : user.username,
            password : user.password,
            role : Erole.PLAYER,
            status : EUserStatus.ACTIVE,
            createdAt : new Date(),
            updatedAt : new Date(),

        }
        usersDB.push(newUser);

        if(!UsersService.writeUsersDB(usersDB)){
            return undefined;
        }
        return newUser;
    }
}