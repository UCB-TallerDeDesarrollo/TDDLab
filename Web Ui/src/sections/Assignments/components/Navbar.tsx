
import { Button,Box, Drawer,AppBar,IconButton,Toolbar,Typography } from "@mui/material";
import NavLateralMenu from "./NavLateralMenu";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu"
import InboxIcon from "@mui/icons-material/Inbox"

const navLinks=[
    {
        title:"Grupos", 
        path: "#",
        icon: <InboxIcon/>
    },
    {
        title:"Tareas", 
        path: "#login",
        icon: <InboxIcon/>
    },
    {
        title:"Usuario", 
        path: "#register",
        icon: <InboxIcon/>
    },
]

export default function Navbar(){
    const [open, setOpen]=useState(false)
    return(
      <>
        <AppBar position="fixed" sx={{ background: '#052845' }}> 
            <Toolbar>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={()=>setOpen(true)}
                    sx={{display:{xs:"flex",sm:"none"}}}
                >
                    <MenuIcon/>
                </IconButton>
                <Typography 
                    variant="h6"
                    sx={{flexGrow:1}}
                >
                TDDLab 
                </Typography>
                <Box sx={{display:{ xs:"none", sm:"block"}}}>
                        {navLinks.map(item=>(
                            <Button 
                            color="inherit" 
                            key={item.title}
                            component="a"
                            href={item.path}
                            
                            >{item.title}
                            
                            </Button>
                        )) }
            </Box>
             
            </Toolbar>
        </AppBar>
       
     <Drawer
        open={open}
        anchor="left"
        onClose={()=>setOpen(false)}
        sx={{display:{xs:"flex",sm:"none"}}}
     >
        <NavLateralMenu navLinks={navLinks}/>
     </Drawer>
      </>  
    )
}