import { Skeleton, Box, Paper } from "@mui/material";

interface GroupSkeletonProps {
  count?: number;
}

const GroupSkeleton = ({ count = 3 }: GroupSkeletonProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {Array.from({ length: count }).map((_, index) => (
        <Paper
          key={index}
          sx={{
            p: 2,
            borderRadius: "10px",
            border: "1px solid #e7e7e7",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton variant="text" width="200px" height={28} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default GroupSkeleton;
