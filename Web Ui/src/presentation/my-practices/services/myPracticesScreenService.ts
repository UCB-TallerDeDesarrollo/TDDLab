import { CreatePractice } from "../../../modules/Practices/application/CreatePractice";
import { DeletePractice } from "../../../modules/Practices/application/DeletePractice";
import { UpdatePractice } from "../../../modules/Practices/application/UpdatePractice";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import PracticesRepository from "../../../modules/Practices/repository/PracticesRepository";
import {
  CreatePracticeInput,
  MyPracticesSortOption,
  PracticeListItemViewModel,
} from "../types/myPracticesScreen";

const practicesRepository = new PracticesRepository();
const createPracticeUseCase = new CreatePractice(practicesRepository);
const deletePracticeUseCase = new DeletePractice(practicesRepository);
const updatePracticeUseCase = new UpdatePractice(practicesRepository);

export const myPracticesService = {
  async getByUserId(userid: number): Promise<PracticeDataObject[]> {
    return practicesRepository.getPracticeByUserId(userid);
  },

  async create(input: CreatePracticeInput): Promise<void> {
    const payload: PracticeDataObject = {
      id: 0,
      title: input.title,
      description: input.description,
      state: "pending",
      creation_date: new Date(),
      userid: input.userid,
    };

    await createPracticeUseCase.createPractice(payload);
  },

  async delete(practiceId: number): Promise<void> {
    await deletePracticeUseCase.DeletePractice(practiceId);
  },

  async update(practiceId: number, data: PracticeDataObject): Promise<void> {
    await updatePracticeUseCase.updatePractice(practiceId, data);
  },
};

export const resolveMyPracticesPermissions = (role: string) => ({
  canManagePractices:
    role === "admin" || role === "teacher" || role === "student",
  canCreatePractices:
    role === "admin" || role === "teacher" || role === "student",
});

export const orderPractices = (
  practices: PracticeDataObject[],
  sorting: MyPracticesSortOption,
): PracticeDataObject[] => {
  if (practices.length === 0) {
    return practices;
  }

  const sorted = [...practices];

  if (sorting === "A_Up_Order") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sorting === "A_Down_Order") {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sorting === "Time_Up") {
    sorted.sort((a, b) => b.id - a.id);
  } else if (sorting === "Time_Down") {
    sorted.sort((a, b) => a.id - b.id);
  }

  return sorted;
};

export const toPracticeListItem = (
  practice: PracticeDataObject,
): PracticeListItemViewModel => ({
  id: practice.id,
  title: practice.title,
  description: practice.description,
  state: practice.state,
  creationDate: practice.creation_date,
  userid: practice.userid,
});

export const toPracticeListItems = (
  practices: PracticeDataObject[],
): PracticeListItemViewModel[] => practices.map(toPracticeListItem);
