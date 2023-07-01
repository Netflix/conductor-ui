import { colors, fontFamily, fontSizes } from '@hawkins/variables';
import { makeStyles } from '@hawkins/styles';

export const useStyles = makeStyles({
    dottedLine: {
        strokeWidth: '1px',
        stroke: 'currentColor',
        fillOpacity: 0,
        opacity: 0.2,
        strokeDasharray: '5, 3',
    },
    cursorLine: {
        strokeWidth: '1px',
        stroke: 'currentColor',
        fillOpacity: 0,
        opacity: 0.4,
        strokeDasharray: '5, 3',
    },
    xAxisLabel: {
        font: `${fontSizes.fontSize3} ${fontFamily.fontFamilySans}`,
        fill: colors.black,
    },
});
