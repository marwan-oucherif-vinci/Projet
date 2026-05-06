import { Request, Response, Router } from "express";
import { LoggerService } from "../services/logger.service";
import { TeamsService } from "../services/teams.service";
import { NewTeamDTO, Team, TeamDTO, TeamShortDTO } from "../models/team.model";
import { TeamsMapper } from "../mappers/teams.mapper";
import { isNewTeamDTO, isTeamDTO } from "../utils/guards";
import { AuthenficatedRequest } from "../models/auth.model";
import { AuthService } from "../services/auth.service";
import { Erole } from "../models/user.models";

export const teamsController = Router();

teamsController.get("/", (req: Request, res: Response) => {
  LoggerService.info("[GET] /teams/");
  const teams = TeamsService.getAll();
  const teamsDTO: TeamShortDTO[] = [];
  for (let i = 0; i < teams.length; i++) {
    teamsDTO.push(TeamsMapper.toShortDTO(teams[i]));
  }
  return res.status(200).json(teamsDTO);
});

teamsController.post(
  "/",
  AuthService.authorize,
  (req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[POST] /teams/");
    const teamDTO: NewTeamDTO = req.body;
    const loggedInUser = req.user;

    if (!isNewTeamDTO(teamDTO)) {
      LoggerService.error("Invalid or missing fields");
      return res.status(400).json({ error: `Invalid or missing fields` });
    }
    if (loggedInUser?.role !== Erole.TRAINER) {
      LoggerService.error("Authentificated user is not a trainer");
      return res
        .status(403)
        .json({ error: `Authentificated user is not a trainer` });
    }

    const trainerId = loggedInUser.id;
    const team: Team | undefined | "Name Already Exists" = TeamsService.create(
      TeamsMapper.fromNewTeamDTO(teamDTO),
      trainerId,
    );
    if (team === "Name Already Exists") {
      LoggerService.error("Name already exists");
      return res
        .status(400)
        .json({ error: `Team name : '${teamDTO.name}' already exist` });
    }
    if (!team) {
      LoggerService.error("User not created");
      return res.status(500).send("User not created");
    }
    LoggerService.info("Team created");
    return res.status(201).json(TeamsMapper.toDTO(team));
  },
);

teamsController.get(
  "/own",
  AuthService.authorize,
  (req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[GET] /teams/own ");
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.sendStatus(401);
    }
    const userId: number = loggedInUser.id;

    const myTeams = TeamsService.getOwnTeams(userId);
    const result = [];
    for (let i = 0; i < myTeams.length; i++) {
      result.push(TeamsMapper.toFullDTO(myTeams[i]));
    }
    return res.status(200).json(result);
  },
);

teamsController.get("/:id", (req: Request, res: Response) => {
  LoggerService.info("[GET] /teams/:id");
  const id = Number(req.params.id);

  if (isNaN(id)) {
    LoggerService.error("Not a valid number");
    return res
      .status(400)
      .json({ error: `Invalid team id : ${req.params.id}  ` });
  }
  const team = TeamsService.getById(id);
  if (!team) {
    LoggerService.error("Team not found");
    return res.status(404).json({ error: `Team with id ${id} not found` });
  }
  return res.status(200).json(TeamsMapper.toDTO(team));
});

teamsController.put(
  "/:id",
  AuthService.authorize,
  (req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[PUT] /teams/:id");
    const id = Number(req.params.id);
    const teamDTO: TeamDTO = req.body;
    const loggedInUser = req.user;

    if (loggedInUser?.role !== Erole.TRAINER) {
      LoggerService.error("Authenticated user is not a trainer");
      return res
        .status(403)
        .json({
          error: `Authenticated user with id ${loggedInUser?.id} is not a trainer`,
        });
    }
    if (isNaN(id)) {
      LoggerService.error("Not a valid number");
      return res.status(400).json({ error: `Invalid id : ${req.params.id}  ` });
    }

    if (id !== teamDTO.id) {
      LoggerService.error("ID mismatch between URL and Body");
      return res.status(400).json({ error: "ID mismatch " });
    }
    if (!isTeamDTO(teamDTO)) {
      LoggerService.error("Invalid payloads");
      return res.status(400).json({ error: `Invalid payload` });
    }

    const existingTeam = TeamsService.getById(id);
    if (!existingTeam) {
      LoggerService.error("Team not found");
      return res
        .status(404)
        .json({ error: `Team with id ${req.params.id} not found` });
    }
    if (loggedInUser.id !== existingTeam?.trainerId) {
      LoggerService.error("The trainer is not the trainer of this team");
      return res
        .status(403)
        .json({
          error: `Trainer with id ${loggedInUser.id} is not the trainer of team ${id}`,
        });
    }

    const teamUpdated = TeamsService.update(
      TeamsMapper.fromDTO(teamDTO),
      loggedInUser.id,
    );

    if (!teamUpdated) {
      LoggerService.error("Team not found");
      return res.status(404).json({ error: `Team with id ${id} not found` });
    }
    return res.status(200).json(TeamsMapper.toDTO(teamUpdated));
  },
);


teamsController.patch(
  "/:id/join",
  AuthService.authorize,
  (req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[PATCH] /teams/:id/join");
    const teamId = Number(req.params.id);
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.sendStatus(401);
    }

    if (isNaN(teamId)) {
      LoggerService.error("Not a valid number");
      return res
        .status(400)
        .json({ error: `Invalid team id : ${req.params.id}  ` });
    }

    const userId = loggedInUser?.id; // 
    const result = TeamsService.joinTeam(teamId, userId);

    if (result === "ALREADY_IN") {
      LoggerService.error("User is already in the team");
      return res
        .status(400)
        .json({ error: `User ${userId} is already in the team ${teamId}` });
    }

    if (!result) {
      LoggerService.error("Team not found");
      return res
        .status(404)
        .json({ error: `Team with id ${teamId} not found` });
    }
    return res.status(200).json(TeamsMapper.toDTO(result));
  },
);

teamsController.patch(
  "/:id/leave",
  AuthService.authorize,
  (req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[PATCH] /teams/:id/leave");
    const teamId = Number(req.params.id);
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.sendStatus(401);
    }
    if (isNaN(teamId)) {
      LoggerService.error("Not a valid number");
      return res
        .status(400)
        .json({ error: `Invalid team id : ${req.params.id}  ` });
    }
    const team = TeamsService.getById(teamId);
    if (loggedInUser.id === team?.trainerId) {
      LoggerService.error("Trainer tried to leave his team");
      return res.status(403).json({ error: `Trainer can't leave his team` });
    }
    const userId = loggedInUser.id;
    const result = TeamsService.leaveTeam(teamId, userId);

    if (!result) {
      LoggerService.error("Team not found or user not in team");
      return res
        .status(404)
        .json({
          error: `Team ${teamId} not found or user ${userId} is not in this team`,
        });
    }

    return res.status(200).json(TeamsMapper.toDTO(result));
  },
);
