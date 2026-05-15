import { Skeleton, Box, Paper } from "@mui/material";

interface AssignmentSkeletonProps {
  count?: number;
}

const AssignmentSkeleton = ({ count = 3 }: AssignmentSkeletonProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: count }).map((_, index) => (
        <Paper
          key={index}
          sx={{
            p: 2,
            borderRadius: "8px",
            border: "1px solid #e7e7e7",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="80%" height={12} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default AssignmentSkeleton;
