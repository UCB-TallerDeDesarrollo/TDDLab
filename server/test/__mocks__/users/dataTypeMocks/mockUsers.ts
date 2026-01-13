import { User } from "../../../../src/modules/Users/Domain/User";

export const mockUsers: User[] = [
    { id: 50, email: 'user1@example.com', groupid: [70], role: 'admin', firstName: "Jhon", lastName: "Doe" },
    { id: 51, email: 'user2@example.com', groupid: [70], role: 'user', firstName: "Jane", lastName: "Smith" },
    { id: 52, email: 'user3@example.com', groupid: [71], role: 'user', firstName: "Bob", lastName: "Jhonson" },
  ];