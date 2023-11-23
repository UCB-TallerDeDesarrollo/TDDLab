import { Request, Response } from "express";
import CreateGroupUseCase from "../../modules/Groups/application/GroupUseCases/createGroupUseCase";
import DeleteGroupUseCase from "../../modules/Groups/application/GroupUseCases/deleteGroupUseCase";
import GetGroupByIdUseCase from "../../modules/Groups/application/GroupUseCases/getGroupByIdUseCase";
import GetGroupsUseCase from "../../modules/Groups/application/GroupUseCases/getGroupsUseCase";
import UpdateGroupUseCase from "../../modules/Groups/application/GroupUseCases/updateGroupUseCase";
import GroupRepository from "../../modules/Groups/repositories/GroupRepository";

class GroupsController {
  private createGroupUseCase: CreateGroupUseCase;
  private deleteGroupUseCase: DeleteGroupUseCase;
  private getGroupByIdUseCase: GetGroupByIdUseCase;
  private getGroupsUseCase: GetGroupsUseCase;
  private updateGroupUseCase: UpdateGroupUseCase;

  constructor(repository: GroupRepository) {
    this.createGroupUseCase = new CreateGroupUseCase(repository);
    this.deleteGroupUseCase = new DeleteGroupUseCase(repository);
    this.getGroupByIdUseCase = new GetGroupByIdUseCase(repository);
    this.getGroupsUseCase = new GetGroupsUseCase(repository);
    this.updateGroupUseCase = new UpdateGroupUseCase(repository);
  }

  async getGroups(_req: Request, res: Response): Promise<void> {
    try {
      const groups = await this.getGroupsUseCase.execute();
      res.status(200).json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async getGroupById(req: Request, res: Response): Promise<void> {
    try {
      const groupId = req.params.id;
      const group = await this.getGroupByIdUseCase.execute(groupId);
      if (group) {
        res.status(200).json(group);
      } else {
        res.status(404).json({ error: "Group not found" });
      }
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupDetail } = req.body;
      const newGroup = await this.createGroupUseCase.execute({ groupDetail });
      res.status(201).json(newGroup);
    } catch (error) {
      console.error("Error adding group:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async deleteGroup(req: Request, res: Response): Promise<void> {
    try {
      const groupId = req.params.id;
      await this.deleteGroupUseCase.execute(groupId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateGroup(req: Request, res: Response): Promise<void> {
    try {
      const groupId = req.params.id;
      const { groupDetail } = req.body;

      const updatedGroup = await this.updateGroupUseCase.execute(groupId, {
        id: groupId, // Add the id here
        groupDetail,
      });

      if (updatedGroup) {
        res.status(200).json(updatedGroup);
      } else {
        res.status(404).json({ error: "Group not found" });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default GroupsController;
