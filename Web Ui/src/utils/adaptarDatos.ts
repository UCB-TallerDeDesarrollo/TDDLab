import UserOnDb from "../modules/User-Authentication/domain/userOnDb.interface";

export function adaptarDatos(authData: {
    id: number;
    usergroupid: number;
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    userRole: string | undefined;
  }): UserOnDb {
    return {
        id:authData.id,
        email: authData.userEmail !== undefined ? authData.userEmail : " ",
        groupid: authData.usergroupid,
        role: authData.userRole !== undefined ? authData.userRole : " " // Ajusta según tu necesidad, no hay una correspondencia directa en AuthData
      };
  }

  