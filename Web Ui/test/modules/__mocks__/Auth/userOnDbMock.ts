import { UserOnDb } from "../../../../src/modules/User-Authentication/domain/userOnDb.interface";
import { UserRole } from "../../../../src/modules/User-Authentication/domain/session.types";

export const dbUserMock: UserOnDb = {
  id: 1,
  email: "test@gmail.com",
  groupid: 1,
  role: UserRole.Student,
};
