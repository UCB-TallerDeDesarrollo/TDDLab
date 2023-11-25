import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface CreateGroupPopupProps {
  open: boolean;
  handleClose: () => void;
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({ open, handleClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCancel = () => {
    handleClose();
  };

  const handleCreate = () => {
    handleClose();
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
