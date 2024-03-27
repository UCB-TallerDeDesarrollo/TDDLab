import GroupRepository from "../../repositories/GroupRepository";
// import GroupDTO from "../../domain/Group";

class CheckGroupExistsUseCase{
    private groupRepository: GroupRepository;

    constructor(groupRepository: GroupRepository){
        this.groupRepository= groupRepository;
    }

    async execute(groupid: number): Promise<boolean>{
        try{
            const exists = await this.groupRepository.checkGroupExists(groupid);
            return exists;
        }catch(error:any){
            throw new Error(`Group does not exist: ${error.message}`)
        }
    }
}

export default CheckGroupExistsUseCase