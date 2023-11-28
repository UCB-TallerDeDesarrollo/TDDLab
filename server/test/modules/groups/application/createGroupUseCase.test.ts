import CreateGroupUseCase from '../../../../src/modules/Groups/application/GroupUseCases/createGroupUseCase';
import GroupRepository from '../../../../src/modules/Groups/repositories/GroupRepository';

// Mock the GroupRepository to isolate the tests
jest.mock('../../../../src/modules/Groups/repositories/GroupRepository');

describe('CreateGroupUseCase', () => {
  let groupRepository: jest.Mocked<GroupRepository>;
  let createGroupUseCase: CreateGroupUseCase;

  beforeEach(() => {
    groupRepository = new GroupRepository() as jest.Mocked<GroupRepository>;
    createGroupUseCase = new CreateGroupUseCase(groupRepository);
  });

  it('should create a new group successfully', async () => {
    // Arrange
    const groupDetail = 'Test Group';
    const createGroupDTO = { groupDetail };

    // Mock the implementation of createGroup in GroupRepository
    groupRepository.createGroup.mockResolvedValue({ id: 1, ...createGroupDTO });

    // Act
    const result = await createGroupUseCase.execute(createGroupDTO);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.groupDetail).toBe(createGroupDTO.groupDetail);
  });

  it('should handle errors when creating a group', async () => {
    // Arrange
    const groupDetail = 'Test Group';
    const createGroupDTO = { groupDetail };
    const errorMessage = 'Failed to create group';

    // Mock the implementation of createGroup in GroupRepository to simulate an error
    groupRepository.createGroup.mockRejectedValue(new Error(errorMessage));

    // Act and Assert
    await expect(createGroupUseCase.execute(createGroupDTO)).rejects.toThrowError(errorMessage);
  });
});