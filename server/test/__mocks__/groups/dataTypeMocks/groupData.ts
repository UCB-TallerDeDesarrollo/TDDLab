import GroupDTO from "../../../../src/modules/Groups/domain/Group";

export const getDataListOfGroupsMock: GroupDTO[] = [
  {
    id: 1,
    groupName: "Grupo 1",
    groupDetail: "Detalles del Grupo 1",
    creationDate: new Date("2023-12-08T08:00:00.000Z"),
  },
  {
    id: 2,
    groupName: "Grupo 2",
    groupDetail: "Detalles del Grupo 2",
    creationDate: new Date("2023-12-08T08:00:00.000Z"),
  },
  {
    id: 3,
    groupName: "Grupo 3",
    groupDetail: "Detalles del Grupo 3",
    creationDate: new Date("2023-12-08T08:00:00.000Z"),
  },
  {
    id: 4,
    groupName: "Grupo 4",
    groupDetail: "Detalles del Grupo 4",
    creationDate: new Date("2023-12-08T08:00:00.000Z"),
  },
];

export const getDataGroupMock: GroupDTO = {
  id: 1,
  groupName: "Grupo",
  groupDetail: "Detalles del Grupo",
  creationDate: new Date("2023-12-08T08:00:00.000Z"),
};

export const getModifiedGroupDataMock: GroupDTO = {
  id: 1,
  groupName: "Grupo actualizado",
  groupDetail: "Detalles del Grupo actualizado",
  creationDate: new Date("2023-12-08T08:00:00.000Z"),
};
