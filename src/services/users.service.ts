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

    


    private static writeUsersDB(users: User[]) : boolean {
        let dbos : UserDBO [] = [];

    for(const user of users){
        dbos.push(UsersMapper.toDBO(user));
    }
    
        try{
            FilesService.writeFile<UserDBO>(this.dbPath,dbos) 
            return true;
        } catch (error){
            LoggerService.error("Error writing users.json: " + error);
            return false;
    }

}




    static getAll(): User[]{
        return this.readUsersDB();
    }



    // the user : NewUser is like NewUserDtO, just we have some rules to respect (tasks are split), but in the logic, the have the same attribut and roles
    static create (user : NewUser) : User | undefined {
        const usersDB : User [] = this.readUsersDB(); 

        
        let isDuplicated = false;
        for (const existingUser of usersDB) {
           if (existingUser.email === user.email || existingUser.username === user.username){
                isDuplicated = true;
                break;
            }
        }
        if(isDuplicated){
            LoggerService.error("User already exists with this email or username ")
            return undefined;

        }
        
        const password = bcrypt.hashSync(user.password,10);
        const newUser : User = {
            id : usersDB.length + 1,
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            username : user.username,
            password : password,
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

    static getByUsername(username : string) : User | undefined {
        const usersDB : User[] = this.readUsersDB(); 
        for (const user of usersDB) {
           if(user.username === username) {
            return user;
           }
        }
        return undefined;
    }

    static getByEmail(email : string) : User | undefined {
        const usersDB : User [] = this.readUsersDB();
        for (const user of usersDB) {
            if (user.email === email) {
                return user;
            }
                        
        }
        return undefined;
    }

    static getById (id : number) : User | undefined {
        const usersDB : User [] = this.readUsersDB();
        for (const user of usersDB) {
           if(user.id === id){
            return user;
           }
            
        }
        return undefined;
    }
    public static update(user:User) : User | undefined {
        const data: User [] = UsersService.readUsersDB();
        let index = -1;

        for (let i = 0; i < data.length; i++) {
           if(user.id === data[i].id){
            index = i;
            break;
           }
        }
        if(index === -1){
            return undefined;
        }
        user.createdAt = data[index].createdAt;
        user.updatedAt = new Date();

        user.password = data[index].password;
        user.role = data[index].role;
        user.status = data[index].status;

        data[index] = user;

        if(!UsersService.writeUsersDB(data)){
            return undefined;
        }
        return user;
    }

    public static delete(id:number):User |undefined {
        const data : User[] = UsersService.readUsersDB();
        let index = -1;

        for (let i = 0; i < data.length; i++) {
           if(data[i].id===id){
            index = i;
            break;
           }
        }
        if(index === -1){
            return undefined;
        }
        if(data[index].role === Erole.ADMIN){
            return undefined;
        }

        data[index].status = EUserStatus.INACTIVE;
        data[index].updatedAt = new Date();
        
        if(!UsersService.writeUsersDB(data)){
            return undefined;
        }
        return data[index];

}

public static updateRole(id: number, newRole: Erole): User | undefined {
    const data: User[] = UsersService.readUsersDB();
    let index = -1;

    for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return undefined;

  
    if (data[index].role !== Erole.PLAYER) {
        return undefined; 
    }

    data[index].role = newRole;
    data[index].updatedAt = new Date();

    if (!UsersService.writeUsersDB(data)) {
        return undefined;
    }

    return data[index];
}

public static reactivate(id:number):User |undefined {
        const data : User[] = UsersService.readUsersDB();
        let index = -1;

        for (let i = 0; i < data.length; i++) {
           if(data[i].id===id){
            index = i;
            break;
           }
        }
        if(index === -1){
            return undefined;
        }
        if(data[index].role === Erole.ADMIN){
            return undefined;
        }

        data[index].status = EUserStatus.ACTIVE;
        data[index].updatedAt = new Date();
        
        if(!UsersService.writeUsersDB(data)){
            return undefined;
        }
        
        return data[index];

}
}
