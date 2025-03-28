import React from "react";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import { CustomFabProps } from "./CustomFabProps";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Zoom from "@mui/material/Zoom";
import Fab from "@mui/material/Fab";

/**
 * Scroll to top fab
 * @returns Component
 */
export function ScrollTopFab(props: CustomFabProps) {
  // Destruct
  const { color, size, target, title } = props;

  // Scroll trigger
  const trigger = useScrollTrigger({
    target,
    disableHysteresis: true,
    threshold: 120
  });

  // Icon click handler
  // behavior: 'smooth'
  const handleClick = () => {
    target.scrollTo({ top: 0 });
  };

  return trigger ? (
    <Zoom in={trigger}>
      <Fab color={color} size={size} title={title} onClick={handleClick}>
        <VerticalAlignTopIcon />
      </Fab>
    </Zoom>
  ) : (
    <React.Fragment />
  );
}
