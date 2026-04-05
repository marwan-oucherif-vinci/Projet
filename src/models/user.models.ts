import { time } from "node:console";

export enum Erole {
    ADMIN = 'admin',
    PLAYER = 'player',
    REFEREE = 'referee',
    TRAINER = 'trainer',
}

export enum EUserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}
export interface User{
     id : number,
    email : string,
    firstName : string,
    lastName : string,
    username : string,
    password : string,
    role : Erole,
    status : EUserStatus,
    createdAt : Date,
    updatedAt : Date,
}

export interface UserDBO {
    id : number;
    email : string;
    first_name : string;
    last_name : string;
    username : string;
    password : string;
    role : Erole;
    status : EUserStatus
    created_at : string;
    updated_at : string
}

export interface UserDTO {
    id : number;
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    password? : string;
    role : Erole;
    status : EUserStatus;
    createdAt? : string;
    updatedAt? : string

}

export interface UserShortDTO {
    id : number,
    firstName : string,
    lastName : string,
}
export interface NewUserDTO {
    firstName : string,
    lastName : string,
    email : string;
    username : string;
    password : string;
}

export interface NewUser {
     firstName : string,
    lastName : string,
    email : string;
    username : string;
    password : string;
}