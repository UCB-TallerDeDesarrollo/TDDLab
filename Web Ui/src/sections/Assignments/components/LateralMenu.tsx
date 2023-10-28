import React, { useState } from 'react'
import {Drawer,IconButton,List,ListItemButton,ListItemIcon,ListItemText} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
const LateralMenu = () => {
  const [openMenu, setOpenMenu] =useState(false);
  return (
    <React.Fragment>
        <Drawer open={openMenu} onClose={()=>setOpenMenu(false)}>
            <List>
                <ListItemButton>
                    <ListItemText>Iniciar sesión</ListItemText>
                </ListItemButton>
            </List>
        </Drawer>
        <IconButton onClick={()=>setOpenMenu(!openMenu)}>
         
        </IconButton>

    </React.Fragment>  
  )
  }

export default LateralMenu