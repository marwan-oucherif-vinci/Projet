import { Request } from "express";
import { User } from "./user.models";

export interface AuthenficatedRequest extends Request {
    user? : User;
}