import { Skeleton, Box, TableRow, TableCell } from "@mui/material";

interface UserSkeletonProps {
  count?: number;
}

const UserSkeleton = ({ count = 5 }: UserSkeletonProps) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={index}>
          <TableCell align="center" sx={{ py: 2.5, borderBottom: "1px solid #E7E7E7" }}>
            <Skeleton variant="text" width="80%" height={20} sx={{ mx: "auto" }} />
          </TableCell>
          <TableCell align="center" sx={{ py: 2.5, borderBottom: "1px solid #E7E7E7" }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mx: "auto" }} />
          </TableCell>
          <TableCell align="center" sx={{ py: 2.5, borderBottom: "1px solid #E7E7E7" }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ mx: "auto", borderRadius: "6px" }} />
          </TableCell>
          <TableCell align="center" sx={{ py: 2.5, borderBottom: "1px solid #E7E7E7" }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mx: "auto" }} />
          </TableCell>
        </TableRow>
      ))}
    </Box>
  );
};

export default UserSkeleton;
