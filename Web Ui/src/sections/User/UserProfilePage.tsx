import { useState, useEffect } from "react";
import { Avatar, Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { GetGroupDetail } from "../../modules/Groups/application/GetGroupDetail";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import { userProfileStyles } from "./styles/userProfileStyles";

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
            const groups = await Promise.all(
                recentGroupIds.map((groupId) => getGroupDetail.obtainGroupDetail(groupId))
            );
            setRecentGroups(groups);
        }
        fetchData();
    }, []);
    return (
        <Box sx={userProfileStyles.page}>
            <Box sx={userProfileStyles.headerGrid}>
                <Box>
                    <Typography sx={userProfileStyles.title}>
                        {email.split("@")[0]}
                    </Typography>

                    <Typography sx={userProfileStyles.subtitle}>
                        {email}
                    </Typography>

                    <Box sx={userProfileStyles.detailsGrid}>
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
                        sx={userProfileStyles.editButton}
                    >
                        Editar
                    </Button>
                </Box>

                <Box sx={userProfileStyles.avatarWrapper}>
                    <Avatar src={avatarUrl} sx={userProfileStyles.avatar}>
                        {email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                </Box>
            </Box>

            <Box sx={{ mt: 5 }}>
                <Box sx={userProfileStyles.groupsTitleRow}>
                    <Typography sx={userProfileStyles.groupsTitle}>
                        Grupos recientes
                    </Typography>
                    <Box sx={userProfileStyles.groupsDivider} />
                </Box>

                <Tabs
                    value={selectedTab}
                    onChange={(_, value) => setSelectedTab(value)}
                    sx={{ mt: 2 }}
                    TabIndicatorProps={{ sx: { backgroundColor: "#9aa3af" } }}
                >
                    {recentGroups.map((group) => {
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
