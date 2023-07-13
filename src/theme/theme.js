import { createTheme } from "@mui/material/styles";
import {
  borders,
  colors,
  spacings,
  fontSizes,
  lineHeights,
  fontWeights,
  fontFamily,
} from "./variables";

function toNumber(v) {
  return parseFloat(v);
}

const baseThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: colors.brand,
    },
    secondary: {
      main: colors.blackLight,
    },
    text: {
      main: colors.black,
    },
  },
  typography: {
    fontFamily: fontFamily.fontFamilySans,
    fontSize: toNumber(fontSizes.fontSize2),
    htmlFontSize: toNumber(fontSizes.fontSize2),
    fontWeightLight: fontWeights.fontWeight0,
    fontWeightRegular: fontWeights.fontWeight0,
    fontWeightMedium: fontWeights.fontWeight1,
    fontWeightBold: fontWeights.fontWeight2,
    h1: {
      fontSize: fontSizes.fontSize10,
      lineHeight: lineHeights.lineHeight0,
      fontWeight: fontWeights.fontWeight2,
    },
    h2: {
      fontSize: fontSizes.fontSize9,
      lineHeight: lineHeights.lineHeight0,
      fontWeight: fontWeights.fontWeight2,
    },
    h3: {
      fontSize: fontSizes.fontSize8,
      lineHeight: lineHeights.lineHeight0,
      fontWeight: fontWeights.fontWeight2,
    },
    h4: {
      fontSize: fontSizes.fontSize7,
      lineHeight: lineHeights.lineHeight0,
      fontWeight: fontWeights.fontWeight2,
    },
    h5: {
      fontSize: fontSizes.fontSize6,
      lineHeight: lineHeights.lineHeight0,
      fontWeight: fontWeights.fontWeight2,
    },
    h6: {
      fontSize: fontSizes.fontSize5,
      lineHeight: lineHeights.lineHeight0,
      fontWeight: fontWeights.fontWeight2,
    },
    body1: {
      fontSize: fontSizes.fontSize4,
      lineHeight: lineHeights.lineHeight1,
    },
    body2: {
      fontSize: fontSizes.fontSize3,
      lineHeight: lineHeights.lineHeight1,
    },
    caption: {
      fontSize: fontSizes.fontSize2,
      lineHeight: lineHeights.lineHeight1,
      fontWeight: fontWeights.fontWeight1,
    },
    button: {
      fontSize: fontSizes.fontSize2,
      fontWeight: fontWeights.fontWeight1,
    },
    shape: {
      borderRadius: toNumber(borders.radiusSmall),
    },
    background: {
      default: "#f5f5f5", //colors.gray14,
    },
  },
};
const baseTheme = createTheme(baseThemeOptions);

const additionalOptions = {
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: "2.4rem",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textDecoration: "none !important",
          textTransform: "none",
          paddingTop: spacings.space1,
          paddingBottom: spacings.space1,
          paddingLeft: spacings.space2,
          paddingRight: spacings.space2,
          border: "1px solid transparent",
          transition: "none",
          "&$focusVisible": {
            boxShadow: "none",
            position: "relative",
            "&:after": {
              content: '""',
              display: "block",
              position: "absolute",
              width: "calc(100% + 6px)",
              height: "calc(100% + 6px)",
              borderRadius: borders.radiusSmall,
              border: borders.blueRegular2px,
              top: -5,
              left: -5,
            },
          },
        },
        text: {
          paddingTop: spacings.space1,
          paddingBottom: spacings.space1,
          paddingLeft: spacings.space2,
          paddingRight: spacings.space2,
          "&:hover": {
            //backgroundColor: baseTheme.palette.grey.A100,
          },
        },
        textSizeSmall: {
          fontSize: "0.8125rem",
        },
        outlined: {
          paddingTop: spacings.space1,
          paddingBottom: spacings.space1,
          paddingLeft: spacings.space2,
          paddingRight: spacings.space2,
        },
        outlinedSecondary: {
          border: borders.blackLight1px,
        },
        contained: {
          "&:disabled": {
            backgroundColor: colors.bgBrandLight,
            //color: baseTheme.palette.common.white,
          },
          boxShadow: "none !important",
          "&:active": {
            boxShadow: "none !important",
          },
        },
        containedPrimary: {
          color: `${colors.white} !important`,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          fontSize: fontSizes.fontSize4,
          padding: spacings.space1,
        },
        colorSecondary: {
          color: colors.blackLight,
          "&$checked": {
            //color: baseTheme.palette.primary.main,
          },
          "&$disabled": {
            color: colors.blackXLight,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borders.radiusSmall,
          height: 24,
          fontSize: fontSizes.fontSize2,
          fontWeight: fontWeights.fontWeight1,
        },
        label: {
          paddingLeft: spacings.space1,
          paddingRight: spacings.space1,
        },
        sizeSmall: {
          fontSize: fontSizes.fontSize0,
          height: 20,
        },
        deleteIcon: {
          height: "100%",
          padding: 3,
          margin: 0,
          backgroundColor: "rgba(5, 5, 5, 0.1)",
          borderRadius: `0 ${borders.radiusSmall} ${borders.radiusSmall} 0`,
          width: 24,
          boxSizing: "border-box",
          textAlign: "center",
          //fill: baseTheme.palette.common.white,
          borderLeftWidth: 1,
          borderLeftStyle: "solid",
          borderLeftColor: "rgba(5, 5, 5, 0.1)",
        },
        deleteIconColorPrimary: {
          color: colors.white,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: spacings.space1,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        sizeMedium: {
          fontSize: 24,
        },
        sizeSmall: {
          fontSize: 16,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: fontSizes.fontSize2,
        },
        input: {
          "&[type=number]::-webkit-inner-spin-button ": {
            appearance: "none",
            margin: 0,
          },
        },
      },
    },

    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          display: "block",
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        transitionDuration: 0,
        elevation: 3,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        InputLabelProps: {
          shrink: true,
        },
      },
    },

    MuiInputLabel: {
      defaultProps: {
        shrink: true,
        disableAnimation: true,
      },
      styleOverrides: {
        outlined: {
          position: "relative",
          marginBottom: 5,
          fontWeight: 600,
          fontSize: "13px",
          transform: "none",
          color: baseTheme.palette.text.primary,

          "&.Mui-focused": {
            color: baseTheme.palette.text.primary,
          },
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        notched: false,
      },
      styleOverrides: {
        root: {
          top: 0,
          backgroundColor: colors.white,
          "& legend": {
            // force-disable notched legends
            display: "none",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: `${colors.brand}`,
          },
        },
        notchedOutline: {
          top: 0,
        },
        input: {
          padding: `${spacings.space2} ${spacings.space2}`,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 3,
      },
    },
    MuiPopover: {
      defaultProps: {
        elevation: 3,
      },
    },

    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: fontSizes.fontSize3,
          lineHeight: lineHeights.lineHeight1,
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        contained: {
          margin: 0,
          marginTop: spacings.space1,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          fontSize: fontSizes.fontSize5,
          marginTop: 3,
          color: baseTheme.palette.text.primary,
        },
        selectMenu: {},
      },
    },
    MuiPickersClockNumber: {
      styleOverrides: {
        clockNumber: {
          top: 6,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.text.primary,
          fontSize: fontSizes.fontSize1,
          "&:hover": {
            backgroundColor: baseTheme.palette.grey[100],
          },
          "&:focus": {
            //backgroundColor: baseTheme.palette.grey[100],
          },
          "&.Mui-selected": {
            backgroundColor: baseTheme.palette.grey[200],
            "&:hover": {
              backgroundColor: baseTheme.palette.grey[200],
            },
            "&:focus": {
              backgroundColor: baseTheme.palette.grey[200],
            },
          },
          "&.Mui-focusVisible": {
            backgroundColor: `${colors.white}`,
          },
          "&:hover.Mui-focusVisible": {
            backgroundColor: baseTheme.palette.grey[100],
          },
          "& .MuiTypography-root": {
            fontSize: "inherit",
          },
          "&.MuiButtonBase-root": {
            paddingLeft: 16,
            paddingRight: 16,
          },
          "&.MuiButtonBase-root p": {
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
        dense: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.primary.main,
          paddingTop: 0,
          paddingBottom: 0,
          marginRight: baseTheme.spacing("space3"),
          marginLeft: baseTheme.spacing("space3"),
          borderRadius: baseTheme.shape.borderRadius,
          boxShadow: "none",
        },
        action: {
          "& button": {
            color: baseTheme.palette.common.white,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 0,
          height: 20,
          width: 40,
          "&:hover": {
            "& > $track": {
              backgroundColor: colors.gray05,
            },
            "& > $checked + $track": {
              backgroundColor: colors.brand05,
            },
          },
        },
        thumb: {
          borderRadius: 8,
          width: 16,
          height: 16,
          boxShadow:
            "0px 1px 2px 0px rgba(0, 0, 0, 0.4), 0px 0px 1px 0px rgba(0, 0, 0, 0.4)",
        },
        track: {
          backgroundColor: colors.gray07,
          borderRadius: 10,
          opacity: 1,
        },
        switchBase: {
          padding: 2,
          "&$checked": {
            transform: "translateX(100%)",
            "& + $track": {
              opacity: 1,
            },
          },
        },
        colorPrimary: {
          "&$checked": {
            color: baseTheme.palette.common.white,
          },
          "&$checked + $track": {
            backgroundColor: baseTheme.palette.primary.main,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none !important",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
        },
        root: {
          minHeight: 0,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        secondary: {
          fontSize: fontSizes.fontSize2,
        },
        primary: {
          fontSize: fontSizes.fontSize2,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          fontSize: fontSizes.fontSize2,
          lineHeight: lineHeights.lineHeight1,
          paddingTop: baseTheme.spacing("space0"),
          paddingBottom: baseTheme.spacing("space0"),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: fontSizes.fontSize2,
        },
        head: {
          //border: 'none',
          fontWeight: fontWeights.fontWeight1,
          color: colors.gray05,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.Mui-selected:hover": {
            backgroundColor: colors.gray12,
          },
          "&.Mui-selected": {
            backgroundColor: `${colors.gray12} !important`,
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.grey[50],
          padding: `${baseTheme.spacing("space5")} ${baseTheme.spacing(
            "space4",
          )}`,
          borderBottom: `1px solid ${colors.blackXXLight}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: baseTheme.spacing("space5"),
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.grey[50],
          padding: `${baseTheme.spacing("space3")} ${baseTheme.spacing(
            "space5",
          )}`,
          borderTop: `1px solid ${colors.blackXXLight}`,
          margin: 0,

          "button + button": {
            marginLeft: spacings.space1,
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          gap: 8,
        },
        regular: {
          minHeight: 80,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.white,
          color: colors.gray00,
          zIndex: 999,
          paddingLeft: 20,
          paddingRight: 20,
          boxShadow: "0 4px 8px 0 rgb(0 0 0 / 10%), 0 0 2px 0 rgb(0 0 0 / 10%)",
          "& .MuiButton-root": {
            //color: colors.black,
          },
          "& .MuiLink-underlineHover:hover": {
            textDecoration: "none !important",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        input: {
          padding: "12px 16px !important",
        },
        paper: {
          fontSize: fontSizes.fontSize2,
        },
        popupIndicator: {
          fontSize: fontSizes.fontSize5,
          color: baseTheme.palette.text.primary,
        },
        clearIndicator: {
          fontSize: fontSizes.fontSize5,
        },
        inputRoot: {
          padding: "0px !important",
        },
        listbox: {
          backgroundColor: baseTheme.palette.common.white,
        },
        tag: {
          "&:first-child": {
            marginLeft: 8,
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        select: {
          paddingRight: "32px !important",
        },
        selectRoot: {
          top: 1,
        },
      },
    },
  },
};

const finalTheme = createTheme({
  ...baseTheme,
  ...additionalOptions,
});
export default finalTheme;
