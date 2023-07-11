import React, {Children, useState} from 'react'
import { styled } from '@mui/material/styles';
// import { withStyles } from '@material-ui/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';



export default function CustomTooltip(props){
    const [open, setOpen] = useState(false);
    const handleTooltipClose = () => {
        setOpen(false);
    }
    const handleTooltipOpen = () => {
        setOpen(true);
    }

    const StyledTooltip = styled(({ className, ...props }:TooltipProps) => (
        <Tooltip {...props} componentsProps={{ tooltip: { className: className } }} />
      ))(`
          color: lightblue;
          background-color: green;
          font-size: 1.5em;
      `);
      

    return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
    <StyledTooltip 
        title={props.title} 
        arrow={props.arrow}
        disableFocusListener
        disableHoverListener
        disableTouchListener     
        open={open}
        onClose={handleTooltipClose}
        
    >
    <svg onClick={handleTooltipOpen}>
    {props.children}
    </svg>
    </StyledTooltip>
    </ClickAwayListener>
    )
}

