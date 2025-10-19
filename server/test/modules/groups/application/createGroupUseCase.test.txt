import CreateGroupUseCase from '../../../../src/modules/Groups/application/GroupUseCases/createGroupUseCase';
import GroupRepository from '../../../../src/modules/Groups/repositories/GroupRepository';

jest.mock('../../../../src/modules/Groups/repositories/GroupRepository');

describe('CreateGroupUseCase', () => {
  let groupRepository: jest.Mocked<GroupRepository>;
  let createGroupUseCase: CreateGroupUseCase;

  beforeEach(() => {
    groupRepository = new GroupRepository() as jest.Mocked<GroupRepository>;
    createGroupUseCase = new CreateGroupUseCase(groupRepository);
  });

  it('should create a new group successfully', async () => {
    const groupDetail = 'Test Group';
    const createGroupDTO = { groupDetail };
    groupRepository.createGroup.mockResolvedValue({ id: 1, ...createGroupDTO });
    const result = await createGroupUseCase.execute(createGroupDTO);
    expect(result.id).toBeDefined();
    expect(result.groupDetail).toBe(createGroupDTO.groupDetail);
  });

  it('should handle errors when creating a group', async () => {
    const groupDetail = 'Test Group';
    const createGroupDTO = { groupDetail };
    const errorMessage = 'Failed to create group';
    groupRepository.createGroup.mockRejectedValue(new Error(errorMessage));
    await expect(createGroupUseCase.execute(createGroupDTO)).rejects.toThrowError(errorMessage);
  });
});