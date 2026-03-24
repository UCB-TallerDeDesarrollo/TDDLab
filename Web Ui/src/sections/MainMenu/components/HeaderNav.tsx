import { useMemo, useState } from "react";
import { Avatar, Box, Typography, IconButton } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ProfileOptions from "./ProfileOptions";

type HeaderNavProps = {
    userName: string;
    avatarUrl: string;
    currentDate?: Date | string;
};

const HeaderNav = ({ userName, avatarUrl, currentDate }: HeaderNavProps) => {
    
    
    const formattedDate = useMemo(() => {
        const dateToUse = currentDate ? new Date(currentDate) : new Date();
        return new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }).format(dateToUse);
    }, [currentDate]);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseProfile = () => {
        setAnchorEl(null);
    };

    return (
        <Box
            component="header"
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#ffffff",
                gap: "1rem",
                borderBottom: "2px solid #000000", 
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CalendarTodayIcon sx={{ color: "#1976d2" }} aria-hidden />
                <Typography variant="body1" fontWeight={500} color="text.primary">
                    {formattedDate}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <NotificationsNoneIcon sx={{ color: "#616161" }} aria-hidden />
                <Typography variant="body1" fontWeight={600} color="text.primary">
                    {userName}
                </Typography>
                <IconButton aria-label={`${userName} profile`}
                sx={{ p: 0 }}
                onClick={(event) => {
                    handleOpenProfile(event)
                }}>
                    <Avatar src={avatarUrl} alt={userName} sx={{ width: 36, height: 36 }} />
                </IconButton>

                <ProfileOptions
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseProfile}
                    userName={userName}
                    email={userName}
                    avatarUrl={avatarUrl}
                />
            </Box>

        </Box>
    );
};

export default HeaderNav;