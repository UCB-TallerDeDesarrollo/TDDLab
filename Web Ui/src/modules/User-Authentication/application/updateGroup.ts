import UsersRepository from "../../Users/repository/UsersRepository";
import { UserDataObject } from "../../Users/domain/UsersInterface";


export async function updateGroupOnDb(user: UserDataObject) {
  
    const userRepo = new UsersRepository();
    userRepo.updateUser(user.id,user.groupid);


}

  