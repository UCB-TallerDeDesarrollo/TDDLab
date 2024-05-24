import { UserDataObject } from "../modules/Users/domain/UsersInterface";

export function adaptarDatos(authData: {
  userid: number | undefined;
    usergroupid: number;
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    userRole: string | undefined;
  }): UserDataObject {
    return {
        id: authData.userid ?? 0,
        email: authData.userEmail ?? " ",
        groupid: authData.usergroupid,
        role: authData.userRole ?? " "
        // Ajusta según tu necesidad, no hay una correspondencia directa en AuthData
      };
  }

  