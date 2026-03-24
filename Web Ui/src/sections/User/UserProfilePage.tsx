import { useState, useEffect } from "react";
import { Avatar, Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { GetGroupDetail } from "../../modules/Groups/application/GetGroupDetail";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";

type UserProfilePageProps = {
    email: string;
    phone: string;
    role: string;
    projectsCount: number | string;
    avatarUrl?: string;
    onEdit?: () => void;
};



const UserProfilePage = ({
    email,
    phone,
    role,
    projectsCount,
    avatarUrl,
    onEdit,
}: UserProfilePageProps) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [recentGroups, setRecentGroups] = useState<(GroupDataObject | null)[]>([]);


    const groupsRepository = new GroupsRepository();
    const getGroupDetail = new GetGroupDetail(groupsRepository);
    const recentGroupIds = localStorage.getItem("recentGroupsIds")?.split(',').map(id => parseInt(id)) || [];

    useEffect(() => {
        async function fetchData() {
            const groups = [];
            for(let groupId of recentGroupIds) {
                const groupDetail = await getGroupDetail.obtainGroupDetail(groupId);
                groups.push(groupDetail);
            }
            setRecentGroups(groups);
        }
        fetchData();
    }, []);
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                px: { xs: 2, md: 4 },
                py: 3,
                backgroundColor: "#ffffff",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                    gap: 4,
                    alignItems: "start",
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: { xs: "2rem", md: "3rem" },
                            fontWeight: 700,
                            lineHeight: 1.05,
                            color: "#111",
                        }}
                    >
                        {email.split("@")[0]}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1,
                            fontSize: { xs: "1.2rem", md: "2rem" },
                            color: "#222",
                        }}
                    >
                        {email}
                    </Typography>

                    <Box
                        sx={{
                            mt: 4,
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            columnGap: 3,
                            rowGap: 1.5,
                            maxWidth: 520,
                        }}
                    >
                        <Typography fontWeight={700}>CORREO:</Typography>
                        <Typography>{email}</Typography>

                        <Typography fontWeight={700}>NÚMERO:</Typography>
                        <Typography>{phone}</Typography>

                        <Typography fontWeight={700}>ROL:</Typography>
                        <Typography>{role}</Typography>

                        <Typography fontWeight={700}>PROYECTOS:</Typography>
                        <Typography>{projectsCount} proyectos</Typography>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={onEdit}
                        sx={{
                            mt: 3,
                            borderRadius: 1,
                            textTransform: "none",
                            px: 3,
                            backgroundColor: "#69be4b",
                            "&:hover": { backgroundColor: "#58a73c" },
                        }}
                    >
                        Editar
                    </Button>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "left", mt: { xs: 1, md: 0 },
            marginRight: 40 }}>
                    <Avatar
                        src={avatarUrl}
                        sx={{
                            width: { xs: 10, md: 260 },
                            height: { xs: 180, md: 260 },
                            border: "10px solid #d7d3ce",
                            bgcolor: "#c7d6e5",
                        }}
                    >
                        {email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                </Box>
            </Box>

            <Box sx={{ mt: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#1b1b1b" }}>
                        Grupos recientes
                    </Typography>
                    <Box
                        sx={{
                            flex: 1,
                            height: 3,
                            borderRadius: 999,
                            background:
                                "linear-gradient(90deg, #d5dbe8 0%, #cfe6cf 55%, #f5c6cc 100%)",
                        }}
                    />
                </Box>

                <Tabs
                    value={selectedTab}
                    onChange={(_, value) => setSelectedTab(value)}
                    sx={{ mt: 2 }}
                    TabIndicatorProps={{ sx: { backgroundColor: "#9aa3af" } }}
                >
                    {recentGroups.map((group) => {
                        console.log("Rendering tab for group ID:", group?.id);
                        return (
                        <Tab
                            key={group?.id}
                            label={`${group?.groupName}`}
                            sx={{ textTransform: "none" }}
                        />
                    )
                    })}
                </Tabs>

                {/* TODO FILL XX */}
                <Box sx={{ minHeight: 260 }} />
            </Box>
        </Box>
    );
};

export default UserProfilePage;