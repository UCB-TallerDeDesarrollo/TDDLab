import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const Divider = styled(Box)({
  width: "100%",
  height: 5,
  backgroundColor: "#D9D9D9",
  borderRadius: 13,
});

function FeatureSectionDivider() {
  return <Divider aria-hidden="true" />;
}

export default FeatureSectionDivider;
