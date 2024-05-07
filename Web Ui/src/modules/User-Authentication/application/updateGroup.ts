import UsersRepository from "../../Users/repository/UsersRepository";
import UserOnDb from "../domain/userOnDb.interface";


export async function updateGroupOnDb(user: UserOnDb) {
  
    const userRepo = new UsersRepository();
    userRepo.updateUser(user.email,user);


}

  