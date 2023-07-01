import { fontFamily, fontSizes } from '@hawkins/variables';

export const getClientY = (event: React.MouseEvent<SVGSVGElement>) =>
    event.clientY;

export const getClientX = (event: React.MouseEvent<SVGSVGElement>) =>
    event.clientX;

export const getTextWidth = (
    ctx: CanvasRenderingContext2D,
    text: string,
    font = `${fontSizes.fontSize3} ${fontFamily.fontFamilySans}`
) => {
    if(ctx){
        ctx.font = font;
        return ctx.measureText(text).width;
    }
};
