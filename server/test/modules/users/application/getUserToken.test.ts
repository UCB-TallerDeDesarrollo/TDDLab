import jwt from "jsonwebtoken";
import { getUserToken } from "../../../../src/modules/Users/Application/getUserToken";
import { User } from "../../../../src/modules/Users/Domain/User";

jest.mock("jsonwebtoken");

describe("getUserToken", () => {
  const user: User = {
    id: 1,
    email: "test@gmail.com",
    role: "admin",
    groupid: [10],
    firstName: "Test",
    lastName:"User"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("Verificar que se obtiene el token correctamente", async () => {
    const fakeToken = "fake.jwt.token";
    (jwt.sign as jest.Mock).mockReturnValue(fakeToken);
    const token = await getUserToken(user);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, role: "admin", groupid: [10] },
      "test_secret",
      { expiresIn: "30d" }
    );
    expect(token).toBe(fakeToken);
  });
});
