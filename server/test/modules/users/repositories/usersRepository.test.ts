import { UserRepository } from "../../../../src/modules/Users/Repositories/UserRepository";
import { Pool } from "pg";
import { mockUsers } from "../../../__mocks__/users/dataTypeMocks/mockUsers";

let repository: UserRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

beforeEach(() => {
  poolConnectMock = jest.fn();
  clientQueryMock = jest.fn();
  poolConnectMock.mockResolvedValue({
    query: clientQueryMock,
    release: jest.fn(),
  });
  jest.spyOn(Pool.prototype, "connect").mockImplementation(poolConnectMock);
  repository = new UserRepository();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("getUsersByGroupId", () => {
  it("should retrieve users by group ID", async () => {
    const groupId = 70;
    const expectedUsers = mockUsers.filter((user) => user.groupid.includes(groupId));

    clientQueryMock.mockResolvedValue({ rows: expectedUsers });

    const result = await repository.getUsersByGroupid(groupId);

    expect(result).toEqual(expectedUsers);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT * FROM userstable WHERE groupid = $1",
      [groupId]
    );
  });

  it("should return an empty array if no users are found for the group ID", async () => {
    const groupId = 99;
    clientQueryMock.mockResolvedValue({ rows: [] });

    const result = await repository.getUsersByGroupid(groupId);

    expect(result).toEqual([]);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT * FROM userstable WHERE groupid = $1",
      [groupId]
    );
  });

  it("should handle errors when obtaining users by group ID", async () => {
    const groupId = 70;
    const error = new Error("Database error");
    poolConnectMock.mockRejectedValue(error);

    await expect(repository.getUsersByGroupid(groupId)).rejects.toThrow(
      "Database error"
    );
    expect(clientQueryMock).not.toHaveBeenCalled();
  });
});
describe('executeQuery', () => {
  it('should execute the query and return the rows', async () => {
    const mockRows = [{ email: 'user1@example.com', groupid: 70, role: 'admin' }];
    clientQueryMock.mockResolvedValue({ rows: mockRows });

    const query = 'SELECT * FROM userstable';
    const rows = await repository.executeQuery(query);

    expect(rows).toEqual(mockRows);
    expect(clientQueryMock).toHaveBeenCalledWith(query, undefined);
  });

  it('should execute the query with values and return the rows', async () => {
    const mockRows = [{ email: 'user1@example.com', groupid: 70, role: 'admin' }];
    clientQueryMock.mockResolvedValue({ rows: mockRows });

    const query = 'SELECT * FROM userstable WHERE groupid = $1';
    const values = [70];
    const rows = await repository.executeQuery(query, values);

    expect(rows).toEqual(mockRows);
    expect(clientQueryMock).toHaveBeenCalledWith(query, values);
  });

  it('should handle errors when executing the query', async () => {
    const error = new Error('Database error');
    poolConnectMock.mockRejectedValue(error);

    const query = 'SELECT * FROM userstable';

    await expect(repository.executeQuery(query)).rejects.toThrow('Database error');
    expect(clientQueryMock).not.toHaveBeenCalled();
  });
});
describe('executeQuery', () => {
    it('should execute the query and return the rows', async () => {
      const mockRows = [{ id: 51, email: 'user1@example.com', groupid: 70, role: 'admin' }];
      clientQueryMock.mockResolvedValue({ rows: mockRows });
  
      const query = 'SELECT * FROM userstable';
      const rows = await repository.executeQuery(query);
  
      expect(rows).toEqual(mockRows);
      expect(clientQueryMock).toHaveBeenCalledWith(query, undefined);
    });
  
    it('should execute the query with values and return the rows', async () => {
      const mockRows = [{ email: 'user1@example.com', groupid: 70, role: 'admin' }];
      clientQueryMock.mockResolvedValue({ rows: mockRows });
  
      const query = 'SELECT * FROM userstable WHERE groupid = $1';
      const values = [70];
      const rows = await repository.executeQuery(query, values);
  
      expect(rows).toEqual(mockRows);
      expect(clientQueryMock).toHaveBeenCalledWith(query, values);
    });
  
    it('should handle errors when executing the query', async () => {
      const error = new Error('Database error');
      poolConnectMock.mockRejectedValue(error);
  
      const query = 'SELECT * FROM userstable';
  
      await expect(repository.executeQuery(query)).rejects.toThrow('Database error');
      expect(clientQueryMock).not.toHaveBeenCalled();
    });
  });
  describe('mapRowToUser', () => {
    it('should map a row to a User object correctly', () => {
      const row = { email: 'user1@example.com', groupid: 70, role: 'admin' };
      const user = repository.mapRowToUser(row);
  
      expect(user).toEqual({ email: 'user1@example.com', groupid: 70, role: 'admin' });
    });
  
    it('should handle an empty row object', () => {
      const user = repository.mapRowToUser({});
  
      expect(user).toEqual({ email: undefined, groupid: undefined, role: undefined });
    });
  });
  describe('registerUser', () => {
    it('should insert a new user into the database', async () => {
      const newUser = { email: 'newuser@example.com', groupid: 70, role: 'user' };
      clientQueryMock.mockResolvedValue({ rowCount: 1 });
  
      await repository.registerUser(newUser);
  
      expect(clientQueryMock).toHaveBeenCalledWith(
        'INSERT INTO usersTable (email,groupid,role) VALUES ($1, $2, $3)',
        [newUser.email, newUser.groupid, newUser.role]
      );
    });
  
    it('should handle errors when inserting a new user', async () => {
      const newUser = { email: 'newuser@example.com', groupid: 70, role: 'user' };
      const error = new Error('Database error');
      clientQueryMock.mockRejectedValue(error);
  
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  
      await repository.registerUser(newUser);
  
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error inserting records:', error);
      expect(clientQueryMock).toHaveBeenCalledWith(
        'INSERT INTO usersTable (email,groupid,role) VALUES ($1, $2, $3)',
        [newUser.email, newUser.groupid, newUser.role]
      );
  
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('obtainUsers', () => {
    it('should return all users when found', async () => {
      const expectedUsers = [
        { email: 'user1@example.com', groupid: 70, role: 'admin' },
        { email: 'user2@example.com', groupid: 70, role: 'user' },
      ];
      clientQueryMock.mockResolvedValue({ rows: expectedUsers });
  
      const users = await repository.obtainUsers();
  
      expect(users).toEqual(expectedUsers);
      expect(clientQueryMock).toHaveBeenCalledWith('SELECT id, email, groupid, role FROM usersTable', undefined);
    });
  
    it('should return null when no users are found', async () => {
      clientQueryMock.mockResolvedValue({ rows: [] });
  
      const users = await repository.obtainUsers();
  
      expect(users).toBeNull();
      expect(clientQueryMock).toHaveBeenCalledWith('SELECT id, email, groupid, role FROM usersTable', undefined);
    });
    
  });

  describe("obtainUserById", () => {
    it("should return a user when found by id", async () => {
      const id = 1; // ID del usuario a obtener
      const expectedUser = { id: 1, email: "user1@example.com", groupid: 70, role: "admin" };
      clientQueryMock.mockResolvedValue({ rows: [expectedUser] });
  
      const user = await repository.obtainUser(id);
  
      expect(user).toEqual(expectedUser);
      expect(clientQueryMock).toHaveBeenCalledWith(
        "SELECT id, email, groupid, role FROM usersTable WHERE id = $1",
        [id]
      );
    });
  
    it("should return null when no user is found by id", async () => {
      const id = 999; // ID que no existe en la base de datos
      clientQueryMock.mockResolvedValue({ rows: [] });
  
      const user = await repository.obtainUser(id);
  
      expect(user).toBeNull();
      expect(clientQueryMock).toHaveBeenCalledWith(
        "SELECT id, email, groupid, role FROM usersTable WHERE id = $1",
        [id]
      );
    });
  });

  describe("obtainUserByEmail", () => {
    it("should return a user when found by email", async () => {
      const email = "user1@example.com";
      const expectedUser = { id: 1, email: "user1@example.com", groupid: 70, role: "admin" };
      clientQueryMock.mockResolvedValue({ rows: [expectedUser] });
  
      const user = await repository.obtainUserByemail(email);
  
      expect(user).toEqual({ id: 1, email: "user1@example.com", groupid: [70], role: "admin" });
      expect(clientQueryMock).toHaveBeenCalledWith(
        "SELECT id, email, groupid, role FROM usersTable WHERE email = $1",
        [email]
      );
    });
    it("should return null when no user is found by email", async () => {
      const email = "nonexistent@example.com";
      clientQueryMock.mockResolvedValue({ rows: [] });
  
      const user = await repository.obtainUserByemail(email);
  
      expect(user).toBeNull();
      expect(clientQueryMock).toHaveBeenCalledWith(
        "SELECT id, email, groupid, role FROM usersTable WHERE email = $1",
        [email]
      );
    });
    it("should handle multiple users with the same email (edge case)", async () => {
      const email = "duplicate@example.com";
      const duplicateUsers = [
        { id: 2, email: "duplicate@example.com", groupid: 70, role: "user" },
        { id: 3, email: "duplicate@example.com", groupid: 71, role: "admin" },
      ];
      clientQueryMock.mockResolvedValue({ rows: duplicateUsers });
  
      const user = await repository.obtainUserByemail(email);
  
      expect(user).toEqual( {"email": "duplicate@example.com", "groupid": [70, 71], "id": 2, "role": "user"});
      expect(clientQueryMock).toHaveBeenCalledWith(
        "SELECT id, email, groupid, role FROM usersTable WHERE email = $1",
        [email]
      );
    });
  });

  describe('removeUserFromGroup', () => {
    it('should delete the user from the group successfully', async () => {
      const userId = 1;
      const mockQueryResult = { rowCount: 1 }; // Eliminación exitosa
  
      clientQueryMock.mockResolvedValue(mockQueryResult);
  
      // Espiar console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  
      await repository.removeUserFromGroup(userId);
  
      expect(clientQueryMock).toHaveBeenCalledWith(
        "DELETE FROM userstable WHERE id = $1",
        [userId]
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(`Usuario con ID ${userId} ha sido eliminado`);
  
      consoleLogSpy.mockRestore(); 
    });

    it('should throw an error if the deletion fails', async () => {
      const userId = 1;
      const error = new Error("Database error");
      clientQueryMock.mockRejectedValue(error);
  
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  
      await expect(repository.removeUserFromGroup(userId)).rejects.toThrow("Database error");
  
      expect(clientQueryMock).toHaveBeenCalledWith(
        "DELETE FROM userstable WHERE id = $1",
        [userId]
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al eliminar usuario", error);
  
      consoleErrorSpy.mockRestore(); 
    });
  });  

  describe("updateUserGroup", () => {
    it("should update the user's group and return the updated user", async () => {
      const userId = 1;
      const newGroupId = 80;
      const updatedUser = { id: userId, email: "user1@example.com", groupid: newGroupId, role: "admin" };
      clientQueryMock.mockResolvedValue({ rows: [updatedUser] });
  
      const result = await repository.updateUser(userId, newGroupId);
  
      expect(result).toEqual(updatedUser);
      expect(clientQueryMock).toHaveBeenCalledWith(
        "UPDATE userstable SET groupid = $2 WHERE id = $1 RETURNING *",
        [userId, newGroupId]
      );
    });
    
    it("should return null if no user is found with the given id", async () => {
      const userId = 999;
      const newGroupId = 80;
      clientQueryMock.mockResolvedValue({ rows: [] });
  
      const result = await repository.updateUser(userId, newGroupId);
  
      expect(result).toBeNull();
      expect(clientQueryMock).toHaveBeenCalledWith(
        "UPDATE userstable SET groupid = $2 WHERE id = $1 RETURNING *",
        [userId, newGroupId]
      );
    });

    it("should handle errors when updating the user's group", async () => {
      const userId = 1;
      const newGroupId = 80;
      const error = new Error("Database error");
      poolConnectMock.mockRejectedValue(error);
  
      await expect(repository.updateUser(userId, newGroupId)).rejects.toThrow("Database error");
      expect(clientQueryMock).not.toHaveBeenCalled();
    });
  }); 