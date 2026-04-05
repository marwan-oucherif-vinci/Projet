import { User, UserDBO, UserDTO, UserShortDTO } from "../models/user.models";

export class UsersMapper {
    static fromDBO(dbo : UserDBO): User{
        return {
            id : dbo.id,
            email : dbo.email,
            firstName : dbo.first_name,
            lastName : dbo.last_name,
            username : dbo.username,
            password : dbo.password,
            role : dbo.role,
            status : dbo.status,
            createdAt : new Date(dbo.created_at),
            updatedAt : new Date (dbo.updated_at),
            //updatedAt : dbo.updated_at ? new Date(dbo.updated_at) : undefined,

        }
    }

    static toDTO(user : User) : UserDTO {
        return {
            id : user.id,
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            username : user.username,
            role : user.role,
            status : user.status,
            updatedAt : user.updatedAt.toISOString(),
            createdAt : user.createdAt.toISOString(),
           }
    }
    static toShortDTO(user : User) : UserShortDTO {
        return {
            id : user.id,
            firstName : user.firstName,
            lastName : user.lastName,
            
        }
    }

    static toDBO(user : User) : UserDBO {
        return {
            id : user.id,
            email : user.email,
            first_name : user.firstName,
            last_name : user.lastName,
            username : user.username,
            password : user.password,
            role : user.role,
            status : user.status,
            created_at : user.createdAt.toISOString(),
            updated_at : user.updatedAt.toISOString(),
        

        
        }
    }

}