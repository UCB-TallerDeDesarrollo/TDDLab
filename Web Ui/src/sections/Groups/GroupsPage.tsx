import React, { useState, useEffect, useMemo, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import CreateGroupPopup from "../Groups/components/GroupsForm";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../modules/Groups/application/GetGroups";
import DeleteGroup from "../../modules/Groups/application/DeleteGroup";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { Container, Collapse } from "@mui/material";
import { styled } from "@mui/system";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import EditGroupPopup from "./components/EditGroupForm";
import { TableView, type TableViewColumn } from "../Shared/Components/TableView";
import CreateButton from "../GeneralPurposeComponents/CreateButton";
import ActionSelect from "../GeneralPurposeComponents/ActionSelect";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

interface GroupTableRow {
  group: GroupDataObject;
  index: number;
}

function Groups() {
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);

  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");

  const groupRepository = useMemo(() => new GroupsRepository(), []);
  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsersByGroupId = useMemo(
    () => new GetUsersByGroupId(userRepository),
    [userRepository]
  );
  const [authData, setAuthData] = useGlobalState("authData");

  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);

  const selectAndSync = useCallback(
    (rawId: unknown) => {
      const id = asId(rawId);
      if (!id) return;
      setCurrentSelectedGroupId(id);
      localStorage.setItem("selectedGroup", String(id));
      if (asId(authData?.usergroupid) !== id) {
        setAuthData({ ...authData, usergroupid: id });
      }
    },
    [authData, setAuthData]
  );

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroupsApp = new GetGroups(groupRepository);
      const role = authData?.userRole ?? "";
      const uid = authData?.userid ?? -1;

      if (role === "teacher") {
        const ids = await getGroupsApp.getGroupsByUserId(uid);
        const allGroups = (
          await Promise.all(ids.map((id: number) => getGroupsApp.getGroupById(id)))
        ).filter(Boolean) as GroupDataObject[];
        setGroups(allGroups);
      } else {
        const allGroups = await getGroupsApp.getGroups();
        setGroups(allGroups);
      }
    };
    fetchGroups();
  }, [authData?.userRole, authData?.userid, groupRepository]);

  const handleGroupsOrder = (event: any) => {
    const value = event.target.value;
    setSelectedSorting(value);

    const sortings = {
      A_Up_Order: () =>
        [...groups].sort((a, b) => a.groupName.localeCompare(b.groupName)),
      A_Down_Order: () =>
        [...groups].sort((a, b) => b.groupName.localeCompare(a.groupName)),
    };

    if (sortings[value]) {
      setGroups(sortings[value]());
    }
  };

  const sortingOptions = [
    { value: "", label: "Ordenar" },
    { value: "A_Up_Order", label: "Ascendente" },
    { value: "A_Down_Order", label: "Descendente" },
  ];

  const groupRows: GroupTableRow[] = groups.map((group, index) => ({ group, index }));

  const groupColumns: TableViewColumn<GroupTableRow>[] = [
    {
      id: "name",
      header: "Grupos",
      renderCell: ({ group }) => group.groupName,
    },
    {
      id: "actions",
      header: (
        <ButtonContainer>
          <ActionSelect
            value={selectedSorting}
            onChange={handleGroupsOrder}
            options={sortingOptions}
            placeholder="Ordenar"
          />
          <CreateButton onClick={() => setCreateGroupPopupOpen(true)} label="Crear" />
        </ButtonContainer>
      ),
      renderCell: ({ index }) => (
        <ButtonContainer>
          <Tooltip title="Editar">
            <IconButton onClick={() => setSelectedRow(index)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton onClick={() => setConfirmationOpen(true)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ButtonContainer>
      ),
    },
  ];

  return (
    <CenteredContainer>
      <section className="Grupos">
        <TableView
          rows={groupRows}
          columns={groupColumns}
          getRowKey={({ group, index }) => asId(group.id) || index}
        />
      </section>

      <CreateGroupPopup
        open={createGroupPopupOpen}
        handleClose={() => setCreateGroupPopupOpen(false)}
        onCreated={(g) => setGroups((prev) => [g, ...prev])}
      />

      <EditGroupPopup
        open={editGroupPopupOpen}
        handleClose={() => setEditGroupPopupOpen(false)}
        groupToEdit={groupToEdit}
        onUpdated={(g) =>
          setGroups((prev) => prev.map((x) => (x.id === g.id ? g : x)))
        }
      />

      {confirmationOpen && (
        <ConfirmationDialog
          open={confirmationOpen}
          title="Eliminar grupo"
          content="¿Seguro?"
          onCancel={() => setConfirmationOpen(false)}
          onDelete={() => setConfirmationOpen(false)}
        />
      )}

      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Eliminado"
          onClose={() => setValidationDialogOpen(false)}
        />
      )}
    </CenteredContainer>
  );
}

export default Groups;