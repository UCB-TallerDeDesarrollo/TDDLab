import { Container, CircularProgress, TableContainer } from "@mui/material";
import { styled } from "@mui/system";

import UsersHeader from "./UsersHeader";
import UsersTable from "./UsersTable";
import { useUsersPageData } from "./useUsersPageData";

// ------------------- ESTILOS -------------------
const CenteredContainer = styled(Container)({
  marginTop: "28px",
});

const StyledTableContainer = styled(TableContainer)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  boxShadow: "none",
  backgroundColor: "#fff",
});
// -------------------------------------------------

function UserPage() {
  const {
    groups, selectedGroup, searchQuery, loading, error,
    filteredUsers, groupMap, setSearchQuery, handleGroupChange, handleRemoveUserFromGroup,
  } = useUsersPageData();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <CenteredContainer>
      <UsersHeader
        searchQuery={searchQuery}
        selectedGroup={selectedGroup}
        groups={groups}
        onSearchChange={setSearchQuery}
        onGroupChange={handleGroupChange}
      />

      <StyledTableContainer>
        <UsersTable
          users={filteredUsers}
          groupMap={groupMap}
          onRemoveUser={handleRemoveUserFromGroup}
        />
      </StyledTableContainer>
    </CenteredContainer>
  );
}

export default UserPage;
