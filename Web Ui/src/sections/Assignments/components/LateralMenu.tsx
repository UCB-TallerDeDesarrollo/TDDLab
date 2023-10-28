import React, { useState } from 'react'
import {Drawer,IconButton,List,ListItemButton,ListItemIcon,ListItemText} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const PAGES=["Iniciar sesión","Grupos","Tareas", "Usuario"];
const LateralMenu = () => {
  const [openMenu, setOpenMenu] =useState(false);
  return (
    <React.Fragment>
        <Drawer open={openMenu} onClose={()=>setOpenMenu(false)}>
            <List>
              {
                PAGES.map((page,index)=>(
                  <ListItemButton onClick={()=>setOpenMenu(false)}key={index}>
                    <ListItemIcon>
                      <ListItemText>{page}</ListItemText>
                    </ListItemIcon>
                    
                </ListItemButton>
                ))
              }
                
            </List>
        </Drawer>
        <IconButton
        sx={{color: "white", marginLeft:"auto"}}
         onClick={()=>setOpenMenu(!openMenu)}
         >
          <MenuIcon />
        </IconButton>
    </React.Fragment>  
  )
  }

export default LateralMenu