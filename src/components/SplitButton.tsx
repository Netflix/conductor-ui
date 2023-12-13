import React from "react";
import {
  ButtonGroup,
  Button,
  Popper,
  Grow,
  Paper,
  MenuList,
  MenuItem,
  ClickAwayListener,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const useStyles = makeStyles({
  buttonRoot: {
    padding: 0,
  },
});

export type SplitButtonProps = {
  children: React.ReactNode;
  options: {
    label: string;
    handler: Function;
  }[];
  onPrimaryClick: React.MouseEventHandler<HTMLElement>;
};

export default function SplitButton({
  children,
  options,
  onPrimaryClick,
}: SplitButtonProps) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<any>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <div>
      <ButtonGroup ref={anchorRef}>
        <Button onClick={onPrimaryClick} color="primary" variant="contained">
          {children}
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleToggle}
          classes={{
            root: classes.buttonRoot,
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map(({ label, handler }, index) => (
                    <MenuItem
                      key={index}
                      onClick={(event) => {
                        handler(event, index);
                        setOpen(false);
                      }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}
