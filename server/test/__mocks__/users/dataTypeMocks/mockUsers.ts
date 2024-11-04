import { User } from "../../../../src/modules/Users/Domain/User";

export const mockUsers: User[] = [
    { id: 50, email: 'user1@example.com', groupid: [70], role: 'admin' },
    { id: 51, email: 'user2@example.com', groupid: [70], role: 'user' },
    { id: 52, email: 'user3@example.com', groupid: [71], role: 'user' },
  ];