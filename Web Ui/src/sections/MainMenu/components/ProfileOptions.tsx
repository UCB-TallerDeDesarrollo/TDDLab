import {  Box, Button, IconButton, Popover, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { useNavigate } from "react-router-dom";
import { setGlobalState } from "../../../modules/User-Authentication/domain/authStates";


type ProfileOptionsProps = {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    userName: string;
    email: string;
    avatarUrl?: string;
};

const ProfileOptions = ({
    anchorEl,
    open,
    onClose,
    userName,
    email,
    avatarUrl,
}: ProfileOptionsProps) => {
    
    const navigate = useNavigate();
    const handleLogout = async () => {
            setGlobalState("authData", {
            userid: -1,
            userProfilePic: "",
            userEmail: "",
            usergroupid: -1,
            userRole: "",
            });
            await removeSessionCookie();
            localStorage.clear();
            navigate("/login");
        };

    const handleProfileSettingsNavigation = async () => {
            navigate("/user_profile");
        };
    
    const recentGroupIds = localStorage.getItem("recentGroupIds");

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
                sx: {
                    mt: 1,
                    width: 360,
                    borderRadius: 4,
                    p: 3,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    borderWidth: 4,
                    borderColor: "#000000"
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: "absolute", top: -8, right: -8 }}
                    aria-label="Close profile menu"
                >
                    <CloseIcon />
                </IconButton>

                <Stack spacing={0.5} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Cuenta
                    </Typography>
                </Stack>

                <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
                   

                    <Typography variant="h5" fontWeight={500} textAlign="center">
                        Hola, {userName}!
                    </Typography>

                    <Box display={'grid'}>
                        <Button
                        variant="outlined"
                        sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            px: 3,
                            color: "blue",
                            borderColor: "blue",
                            marginBottom: 2
                        }}
                        onClick={handleProfileSettingsNavigation}
                    >
                        Configuracion de Cuenta
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            px: 3,
                            borderColor: "#f20d0d",
                            color:"red"
                        }}
                        onClick={handleLogout}
                    >
                        Cerrar Sesion
                    </Button>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent="center"
                    sx={{ mt: 3 }}
                >
                    <Typography variant="caption" color="text.secondary">
                        opt 1
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        •
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        opt 2
                    </Typography>
                </Stack>
            </Box>
        </Popover>
    );
};

export default ProfileOptions;