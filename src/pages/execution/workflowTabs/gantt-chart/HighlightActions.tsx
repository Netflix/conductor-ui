import { IconButton, ButtonGroup, Paper } from '@mui/material';
import {ZoomIn, ZoomOut} from '@mui/icons-material';
import { useGanttChartAPI } from './';

export function HighlightActions() {
    const { zoom, highlightMax, highlightMin, resetZoom } = useGanttChartAPI();

    return (
        <Paper elevation={1} 
        // layout={{ padding: 0 }}
        >
            <ButtonGroup orientation="vertical">
                <IconButton
                    aria-label="zoom in"
                    onClick={() => zoom(highlightMin, highlightMax)}
                >
                    <ZoomIn />
                </IconButton>
                <IconButton
                    aria-label="zoom out"
                   onClick={resetZoom}
                >
                    <ZoomOut />
                </IconButton>
            </ButtonGroup>
        </Paper>
    );
}