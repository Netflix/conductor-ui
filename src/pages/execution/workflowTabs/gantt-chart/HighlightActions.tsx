import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

import { useGanttChartAPI } from "./";

export function HighlightActions() {
  const { zoom, highlightMax, highlightMin, resetZoom } = useGanttChartAPI();

  return (
    <Paper elevation={1}>
      <ButtonGroup orientation="vertical">
        <IconButton
          aria-label="zoom in"
          onClick={() => zoom(highlightMin, highlightMax)}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton aria-label="zoom out" onClick={resetZoom}>
          <ZoomOutIcon />
        </IconButton>
      </ButtonGroup>
    </Paper>
  );
}
