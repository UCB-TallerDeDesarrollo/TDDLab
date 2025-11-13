import UsersRepository from "../repository/UsersRepository";

export class UpdateUserRole {
    constructor(private userRepository: UsersRepository) {}

    async updateUserRole(userId: number, newRole: string): Promise<void> {
        const validRoles = ["student", "teacher", "admin"];
        if (!validRoles.includes(newRole)) {
            throw new Error("Rol invalido");
        }

        if (!userId) {
            throw new Error("El ID de usuario no es valido");
        }

        try {
            await this.userRepository.updateUserRoleById(userId, { role: newRole });
            console.log(`Rol del usuario ${userId} actualizado a ${newRole}`);
        } catch (error) {
            console.error("Error al actualizar el rol del usuario:", error);
            throw error;
        }
    }
}

export default UpdateUserRole;