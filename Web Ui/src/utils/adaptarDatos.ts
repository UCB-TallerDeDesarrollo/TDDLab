import UserOnDb from "../modules/User-Authentication/domain/userOnDb.interface";

export function adaptarDatos(authData: {
    usergroupid: number;
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    userRole: string | undefined;
  }): UserOnDb {
    return {
        email: authData.userEmail !== undefined ? authData.userEmail : " ",
        groupid: authData.usergroupid,
        role: authData.userRole !== undefined ? authData.userRole : " " // Ajusta según tu necesidad, no hay una correspondencia directa en AuthData
      };
  }

  