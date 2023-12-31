import { getGroupsRepositoryMock } from "../__mocks__/groups/repositoryMock";
import {
  getDataListOfGroupsMock,
  getDataGroupMock,
  getModifiedGroupDataMock,
} from "../__mocks__/groups/dataTypeMocks/groupData";
import GroupsController from "../../src/controllers/Groups/groupController";
import { createRequest } from "../__mocks__/assignments/requestMocks";
import { createResponse } from "../__mocks__/assignments/responseMoks";


let controller: GroupsController;
const groupsRepositoryMock = getGroupsRepositoryMock();

beforeEach(() => {
  controller = new GroupsController(groupsRepositoryMock);
});

describe("Get groups", () => {
    it("should respond with a status 200 and a list of groups", async () => {
        const req = createRequest();
        const res = createResponse();
        groupsRepositoryMock.obtainGroups.mockResolvedValue(getDataListOfGroupsMock);
        await controller.getGroups(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(getDataListOfGroupsMock);
    });
    it("should respond with a status 500 and error message when obtainGroups fails", async () => {
        const req = createRequest();
        const res = createResponse();
        groupsRepositoryMock.obtainGroups.mockRejectedValue(new Error());
        await controller.getGroups(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Get group by id", () => {
    it("should respond with a status 200 and the group", async () => {
        const req = createRequest("1");
        const res = createResponse();
        groupsRepositoryMock.obtainGroupById.mockResolvedValue(getDataGroupMock);
        await controller.getGroupById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(getDataGroupMock);
    });
    it("should respond with a status 404 and an error message for non-existent group", async () => {
        const req = createRequest("non_existent_id");
        const res = createResponse();
        groupsRepositoryMock.obtainGroupById.mockResolvedValue(null);
        await controller.getGroupById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
    });
    it("should respond with a status 500 and error message when obtainGroupById fails", async () => {
        const req = createRequest();
        const res = createResponse();
        groupsRepositoryMock.obtainGroupById.mockRejectedValue(new Error());
        await controller.getGroupById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Create Group", () => {
    it("should respond with a status 201 and return the created group", async () => {
        const req = createRequest(undefined, getModifiedGroupDataMock);
        const res = createResponse();
        groupsRepositoryMock.createGroup.mockResolvedValue(getModifiedGroupDataMock);
        await controller.createGroup(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(getModifiedGroupDataMock);
    });
    it("should respond with a status 500 and error message when createGroup fails", async () => {
        const req = createRequest(undefined, getModifiedGroupDataMock);
        const res = createResponse();
        groupsRepositoryMock.createGroup.mockRejectedValue(new Error());
        await controller.createGroup(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Delete Group", () => {
    it("should respond with a status 500 and error message when group deletion fails", async () => {
        const req = createRequest("non_existing_id");
        const res = createResponse();
        groupsRepositoryMock.deleteGroup.mockRejectedValue(new Error());
        await controller.deleteGroup(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Update Group", () => {
    it("should respond with a 500 status and error message when update fails", async () => {
        const req = createRequest("existing_id", getModifiedGroupDataMock);
        const res = createResponse();
        groupsRepositoryMock.updateGroup.mockRejectedValue(new Error());
        await controller.updateGroup(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});
