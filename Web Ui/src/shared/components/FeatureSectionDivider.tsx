import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const Divider = styled(Box)({
  display: "block",
  width: "100%",
  maxWidth: 1301,
  height: 5,
  marginTop: 34,
  marginBottom: 35,
  marginInline: "auto",
  flexShrink: 0,
  backgroundColor: "#D9D9D9",
  borderRadius: 13,
});

function FeatureSectionDivider() {
  return <Divider aria-hidden="true" />;
}

export default FeatureSectionDivider;
