import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import GroupsRepository from '../../../modules/Groups/repository/GroupsRepository';
import GetGroups from '../../../modules/Groups/application/GetGroups';
import { GroupDataObject } from '../../../modules/Groups/domain/GroupInterface';
import CreateGroup from '../../../modules/Groups/application/CreateGroup';


interface CreateGroupPopupProps {
  open: boolean;
  handleClose: () => void;
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({ open, handleClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const groupRepository = new GroupsRepository();
  const getGroups = groupRepository.getGroups();

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      const allGroups = await getGroups.getGroups();
      setGroups(allGroups);
    };

    fetchGroups();
  }, []);

  const handleCancel = () => {
    handleClose();
  };

  const handleCreate = async () => {
    // await createGroup(groupName, groupDescription);
    // const allGroups = await getGroups();
    // setGroups(allGroups);
    // handleClose();
    const createGroup=new CreateGroup(groupRepository);
    const payload: GroupDataObject = {
      id: 1,
      name: '',
      description: '',
    };
    const response =  await createGroup.createGroup(payload);
    console.log('response : ', response);
  };

  return (
    <Dialog open={open} onClose={handleClose}  >
      <DialogTitle style={{ fontSize: '0.8 rem' }}>Crear grupo</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre del grupo*"
          type="text"
          fullWidth
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          InputLabelProps={{ style: { fontSize: '0.95rem' } }}
        />
        <TextField
          multiline  
          rows={3.7}
          margin="dense"
          label="Descripcion*"
          type="text"
          fullWidth
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          InputLabelProps={{ style: { fontSize: '0.95rem' } }}
        />
      </DialogContent>
      <DialogActions >
        <Button onClick={handleCancel} style={{ color: '#555', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button onClick={handleCreate} color="primary" style={{ textTransform: 'none' }}>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupPopup;