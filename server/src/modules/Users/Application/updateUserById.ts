import { UserRepository } from "../Repositories/UserRepository";

const userRepository = new UserRepository;

export async function updateUserById(id: number, name: string, lastName: string) {
    const user = await userRepository.obtainUser(id);

    if (!user) {
        throw new Error("UserNotFound");
    }

    const updateUser = await userRepository.updateUserById(id, name,lastName);
    return updateUser;
}