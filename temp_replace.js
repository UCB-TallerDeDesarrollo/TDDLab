const fs = require('fs');

const file = 'Web Ui/src/sections/Groups/GroupsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const startTarget = '  return (\n    <CenteredContainer>\n      <section className="Grupos">';
const endTarget = '      </section>\n\n      {confirmationOpen && (';

const startIndex = content.indexOf(startTarget);
const endIndex = content.indexOf(endTarget);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `  return (
    <CenteredContainer>
      <section className="Grupos">
        <GenericListContainer>
          <GenericListHeader
            title="Grupos"
            actions={
              <>
                <Button
                  variant="outlined"
                  className="groups-filter-btn"
                  endIcon={<FilterListIcon />}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  Filtrar
                </Button>
                <Menu
                  anchorEl={filterAnchor}
                  open={Boolean(filterAnchor)}
                  onClose={() => setFilterAnchor(null)}
                >
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "A_Up_Order" } }); setFilterAnchor(null); }}>
                    Orden alfabetico ascendente
                  </MenuItem>
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "A_Down_Order" } }); setFilterAnchor(null); }}>
                    Orden alfabetico descendente
                  </MenuItem>
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "Time_Up" } }); setFilterAnchor(null); }}>
                    Recientes
                  </MenuItem>
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "Time_Down" } }); setFilterAnchor(null); }}>
                    Antiguos
                  </MenuItem>
                </Menu>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  className="groups-create-btn"
                  onClick={handleCreateGroupClick}
                >
                  Crear
                </Button>
              </>
            }
          />

          <GenericListBody>
            {groups.map((group, index) => (
              <GenericCard
                key={asId(group.id) || index}
                showCheckbox={true}
                isSelected={asId(currentSelectedGroupId) === asId(group.id)}
                onSelectionChange={() => handleCheckboxChange(index)}
                title={group.groupName}
                onClick={() => handleRowClick(index)}
                onHover={(hovered) => handleRowHover(hovered ? index : null)}
                isExpanded={expandedRows.includes(index)}
                details={<>Detalle del grupo: {group.groupDetail}</>}
                actions={
                  <>
                    <Tooltip title="Editar grupo" arrow>
                      <IconButton aria-label="editar" onClick={(e) => handleEditClick(e, index)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Tareas" arrow>
                      <IconButton aria-label="tareas" onClick={(e) => handleHomeworksClick(e, index)}>
                        <AutoAwesomeMotionIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copiar enlace de invitacion" arrow>
                      <IconButton aria-label="enlace" onClick={(e) => handleLinkClick(e, index)}>
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Participantes" arrow>
                      <IconButton aria-label="estudiantes" onClick={(e) => handleStudentsClick(e, index)}>
                        <GroupsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar grupo" arrow>
                      <IconButton aria-label="eliminar" onClick={(e) => handleDeleteClick(e, index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
            ))}
          </GenericListBody>
        </GenericListContainer>
      </section>

      {confirmationOpen && (`;
      
      const updated = content.substring(0, startIndex) + newContent + content.substring(endIndex + endTarget.length);
      fs.writeFileSync(file, updated);
      console.log('REPLACED');
} else {
  console.log('NOT FOUND', startIndex, endIndex);
}
