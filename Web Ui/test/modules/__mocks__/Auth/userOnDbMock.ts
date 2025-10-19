import { UserOnDb } from "../../../../src/modules/User-Authentication/domain/userOnDb.interface";

export const dbUserMock: UserOnDb = {
  id: 1,
  email: "test@gmail.com",
  groupid: 1,
  role: "student",
};
