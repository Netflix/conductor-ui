export const fontFamily = {
    fontFamilySans : 'apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
}
export const fontSizes = {
    fontSize3 : '14px', 
    fontSize4 : '16px'
}

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


export const smartTimeFormat = (time:string|number, axisTicks:boolean=false)=>{
        let ms:number = 0
        if (typeof time === "string"){
            ms = parseInt(time);
        }else{
            ms = time;
        }
        const [years, yearsms] = [Math.floor(ms/ (31556926000)), ms% 31556926000];
        const [months, monthsms] = [Math.floor(yearsms/ (24*60*60*1000*30.4375)), ms % (24*60*60*1000*30.4375)];
        const [days, daysms] = [Math.floor(monthsms / (24*60*60*1000)), ms % (24*60*60*1000)];
        const [hours, hoursms] = [Math.floor(daysms / (60*60*1000)), ms % (60*60*1000)];
        const [minutes, minutesms] = [Math.floor(hoursms / (60*1000)), ms % (60*1000)];
        const [secs, secsms] = [Math.floor(minutesms / 1000), ms%1000];
        const millis = Math.floor(secsms);
        let precision = 2;
        let strYears = precision && years? `${years}yrs `:"";
        strYears && precision--;
        let strMonths = precision && months? `${months}mos `:"";
        strMonths && precision--;
        let strDays = precision && days? `${days}days `:"";
        strDays && precision--;
        let strHours = precision && hours? `${hours}hrs `:"";
        strHours && precision--;
        let strMins = precision && minutes? `${minutes}mins `:"";
        strMins && precision--;
        let strSecs = precision && secs? `${secs}s `:"";
        strSecs && precision--;
        let strMilliSecs = precision && millis? `${millis}ms `:"";
        strMilliSecs && precision--;
        let label =  strYears+strMonths+strDays+strHours+strMins+strSecs+strMilliSecs;
        if (axisTicks){
            if (years){
                return 'MMMM YYYY';
            }else if(months){
                return 'MMMM D, YYYY'
            }else if(days){
                return 'MMMM D'
            }else if(hours){
                return 'h:mm:ss A'
            }else if(minutes){
            return 'hh:mm:ss'
            }
            return 'hh:mm:ss:SSS'
            
        }
        return label || `0ms`;

}

export const colors = {
    accessibleRedDark: 'rgb(239, 104, 110)',
    accessibleRedDarkT70: 'rgba(239, 104, 110, 0.7)',
    accessibleRedDarkT40: 'rgba(239, 104, 110, 0.4)',
    accessibleRedDarkT20: 'rgba(239, 104, 110, 0.2)',
    accessibleRedDarkT10: 'rgba(239, 104, 110, 0.1)',
    accessibleRedLight: 'rgb(178, 7, 16)',
    accessibleRedLightT70: 'rgba(178, 7, 16, 0.7)',
    accessibleRedLightT40: 'rgba(178, 7, 16, 0.4)',
    accessibleRedLightT20: 'rgba(178, 7, 16, 0.2)',
    accessibleRedLightT10: 'rgba(178, 7, 16, 0.1)',
    black: 'rgb(0, 0, 0)',
    blackT90: 'rgba(0, 0, 0, 0.9)',
    blackT70: 'rgba(0, 0, 0, 0.7)',
    blackT60: 'rgba(0, 0, 0, 0.6)',
    blackT40: 'rgba(0, 0, 0, 0.4)',
    blackT20: 'rgba(0, 0, 0, 0.2)',
    blackT10: 'rgba(0, 0, 0, 0.1)',
    blackT04: 'rgba(0, 0, 0, 0.04)',
    blackT02: 'rgba(0, 0, 0, 0.02)',
    blue0: 'rgb(5, 25, 43)',
    blue1: 'rgb(10, 44, 73)',
    blue2: 'rgb(17, 73, 122)',
    blue3: 'rgb(24, 102, 170)',
    blue4: 'rgb(31, 131, 219)',
    blue5: 'rgb(74, 155, 226)',
    blue6: 'rgb(117, 179, 233)',
    blue7: 'rgb(160, 202, 240)',
    blue8: 'rgb(203, 226, 247)',
    blue9: 'rgb(232, 241, 250)',
    blue: 'rgb(31, 131, 219)',
    blueT70: 'rgba(31, 131, 219, 0.7)',
    blueT40: 'rgba(31, 131, 219, 0.4)',
    blueT20: 'rgba(31, 131, 219, 0.2)',
    blueT10: 'rgba(31, 131, 219, 0.1)',
    cyan0: 'rgb(12, 37, 41)',
    cyan1: 'rgb(17, 57, 63)',
    cyan2: 'rgb(28, 95, 105)',
    cyan3: 'rgb(39, 133, 148)',
    cyan4: 'rgb(50, 171, 190)',
    cyan5: 'rgb(89, 187, 203)',
    cyan6: 'rgb(129, 203, 215)',
    cyan7: 'rgb(168, 219, 227)',
    cyan8: 'rgb(207, 236, 240)',
    cyan9: 'rgb(230, 245, 245)',
    cyan: 'rgb(50, 171, 190)',
    cyanT70: 'rgba(50, 171, 190, 0.7)',
    cyanT40: 'rgba(50, 171, 190, 0.4)',
    cyanT20: 'rgba(50, 171, 190, 0.2)',
    cyanT10: 'rgba(50, 171, 190, 0.1)',
    grape0: 'rgb(37, 16, 43)',
    grape1: 'rgb(59, 25, 67)',
    grape2: 'rgb(98, 41, 112)',
    grape3: 'rgb(137, 58, 156)',
    grape4: 'rgb(176, 74, 201)',
    grape5: 'rgb(191, 109, 211)',
    grape6: 'rgb(206, 144, 222)',
    grape7: 'rgb(222, 178, 232)',
    grape8: 'rgb(237, 213, 243)',
    grape9: 'rgb(244, 232, 247)',
    grape: 'rgb(176, 74, 201)',
    grapeT70: 'rgba(176, 74, 201, 0.7)',
    grapeT40: 'rgba(176, 74, 201, 0.4)',
    grapeT20: 'rgba(176, 74, 201, 0.2)',
    grapeT10: 'rgba(176, 74, 201, 0.1)',
    grayDark0: 'rgb(15, 15, 15)',
    grayDark1: 'rgb(22, 22, 22)',
    grayDark2: 'rgb(35, 35, 35)',
    grayDark3: 'rgb(45, 45, 45)',
    grayDark4: 'rgb(65, 65, 65)',
    grayDark5: 'rgb(78, 78, 78)',
    grayDark6: 'rgb(91, 91, 91)',
    grayDark7: 'rgb(103, 103, 103)',
    grayDark8: 'rgb(116, 116, 116)',
    grayDark9: 'rgb(128, 128, 128)',
    grayDark: 'rgb(128, 128, 128)',
    grayDarkT70: 'rgba(128, 128, 128, 0.7)',
    grayDarkT40: 'rgba(128, 128, 128, 0.4)',
    grayDarkT20: 'rgba(128, 128, 128, 0.2)',
    grayDarkT10: 'rgba(128, 128, 128, 0.1)',
    grayLight0: 'rgb(128, 128, 128)',
    grayLight1: 'rgb(142, 142, 142)',
    grayLight2: 'rgb(155, 155, 155)',
    grayLight3: 'rgb(169, 169, 169)',
    grayLight4: 'rgb(182, 182, 182)',
    grayLight5: 'rgb(196, 196, 196)',
    grayLight6: 'rgb(214, 214, 214)',
    grayLight7: 'rgb(229, 229, 229)',
    grayLight8: 'rgb(242, 242, 242)',
    grayLight9: 'rgb(250, 250, 250)',
    grayLight: 'rgb(128, 128, 128)',
    grayLightT70: 'rgba(128, 128, 128, 0.7)',
    grayLightT40: 'rgba(128, 128, 128, 0.4)',
    grayLightT20: 'rgba(128, 128, 128, 0.2)',
    grayLightT10: 'rgba(128, 128, 128, 0.1)',
    green0: 'rgb(14, 41, 20)',
    green1: 'rgb(22, 62, 29)',
    green2: 'rgb(36, 103, 48)',
    green3: 'rgb(51, 144, 68)',
    green4: 'rgb(65, 185, 87)',
    green5: 'rgb(102, 198, 119)',
    green6: 'rgb(138, 212, 152)',
    green7: 'rgb(174, 225, 184)',
    green8: 'rgb(211, 239, 216)',
    green9: 'rgb(232, 247, 235)',
    green: 'rgb(65, 185, 87)',
    greenT70: 'rgba(65, 185, 87, 0.7)',
    greenT40: 'rgba(65, 185, 87, 0.4)',
    greenT20: 'rgba(65, 185, 87, 0.2)',
    greenT10: 'rgba(65, 185, 87, 0.1)',
    indigo0: 'rgb(15, 22, 46)',
    indigo1: 'rgb(24, 35, 76)',
    indigo2: 'rgb(41, 58, 127)',
    indigo3: 'rgb(57, 82, 177)',
    indigo4: 'rgb(73, 105, 228)',
    indigo5: 'rgb(108, 134, 233)',
    indigo6: 'rgb(143, 163, 238)',
    indigo7: 'rgb(178, 191, 244)',
    indigo8: 'rgb(213, 220, 249)',
    indigo9: 'rgb(235, 237, 250)',
    indigo: 'rgb(73, 105, 228)',
    indigoT70: 'rgba(73, 105, 228, 0.7)',
    indigoT40: 'rgba(73, 105, 228, 0.4)',
    indigoT20: 'rgba(73, 105, 228, 0.2)',
    indigoT10: 'rgba(73, 105, 228, 0.1)',
    orange0: 'rgb(48, 22, 4)',
    orange1: 'rgb(82, 37, 6)',
    orange2: 'rgb(137, 61, 11)',
    orange3: 'rgb(191, 86, 15)',
    orange4: 'rgb(246, 110, 19)',
    orange5: 'rgb(248, 138, 64)',
    orange6: 'rgb(250, 166, 110)',
    orange7: 'rgb(251, 194, 155)',
    orange8: 'rgb(253, 221, 200)',
    orange9: 'rgb(250, 236, 230)',
    orange: 'rgb(246, 110, 19)',
    orangeT70: 'rgba(246, 110, 19, 0.7)',
    orangeT40: 'rgba(246, 110, 19, 0.4)',
    orangeT20: 'rgba(246, 110, 19, 0.2)',
    orangeT10: 'rgba(246, 110, 19, 0.1)',
    pink0: 'rgb(43, 13, 23)',
    pink1: 'rgb(71, 20, 38)',
    pink2: 'rgb(119, 34, 64)',
    pink3: 'rgb(166, 47, 89)',
    pink4: 'rgb(214, 61, 115)',
    pink5: 'rgb(222, 98, 142)',
    pink6: 'rgb(230, 136, 169)',
    pink7: 'rgb(238, 173, 196)',
    pink8: 'rgb(246, 210, 223)',
    pink9: 'rgb(247, 232, 237)',
    pink: 'rgb(214, 61, 115)',
    pinkT70: 'rgba(214, 61, 115, 0.7)',
    pinkT40: 'rgba(214, 61, 115, 0.4)',
    pinkT20: 'rgba(214, 61, 115, 0.2)',
    pinkT10: 'rgba(214, 61, 115, 0.1)',
    red0: 'rgb(46, 2, 4)',
    red1: 'rgb(76, 3, 7)',
    red2: 'rgb(127, 5, 11)',
    red3: 'rgb(178, 7, 16)',
    red4: 'rgb(229, 9, 20)',
    red5: 'rgb(234, 56, 65)',
    red6: 'rgb(239, 104, 110)',
    red7: 'rgb(244, 151, 155)',
    red8: 'rgb(249, 198, 201)',
    red9: 'rgb(250, 230, 232)',
    red: 'rgb(229, 9, 20)',
    redT70: 'rgba(229, 9, 20, 0.7)',
    redT40: 'rgba(229, 9, 20, 0.4)',
    redT20: 'rgba(229, 9, 20, 0.2)',
    redT10: 'rgba(229, 9, 20, 0.1)',
    violet0: 'rgb(22, 15, 46)',
    violet1: 'rgb(38, 25, 75)',
    violet2: 'rgb(63, 42, 125)',
    violet3: 'rgb(88, 58, 176)',
    violet4: 'rgb(113, 75, 226)',
    violet5: 'rgb(140, 110, 232)',
    violet6: 'rgb(168, 144, 237)',
    violet7: 'rgb(195, 179, 243)',
    violet8: 'rgb(222, 213, 248)',
    violet9: 'rgb(237, 235, 250)',
    violet: 'rgb(113, 75, 226)',
    violetT70: 'rgba(113, 75, 226, 0.7)',
    violetT40: 'rgba(113, 75, 226, 0.4)',
    violetT20: 'rgba(113, 75, 226, 0.2)',
    violetT10: 'rgba(113, 75, 226, 0.1)',
    white: 'rgb(255, 255, 255)',
    whiteT90: 'rgba(255, 255, 255, 0.9)',
    whiteT70: 'rgba(255, 255, 255, 0.7)',
    whiteT60: 'rgba(255, 255, 255, 0.6)',
    whiteT40: 'rgba(255, 255, 255, 0.4)',
    whiteT20: 'rgba(255, 255, 255, 0.2)',
    whiteT10: 'rgba(255, 255, 255, 0.1)',
    whiteT04: 'rgba(255, 255, 255, 0.04)',
    whiteT02: 'rgba(255, 255, 255, 0.02)',
    yellow0: 'rgb(48, 31, 0)',
    yellow1: 'rgb(84, 55, 1)',
    yellow2: 'rgb(139, 91, 2)',
    yellow3: 'rgb(195, 128, 3)',
    yellow4: 'rgb(251, 164, 4)',
    yellow5: 'rgb(252, 182, 52)',
    yellow6: 'rgb(253, 199, 100)',
    yellow7: 'rgb(253, 216, 149)',
    yellow8: 'rgb(254, 234, 197)',
    yellow9: 'rgb(250, 242, 230)',
    yellow: 'rgb(251, 164, 4)',
    yellowT70: 'rgba(251, 164, 4, 0.7)',
    yellowT40: 'rgba(251, 164, 4, 0.4)',
    yellowT20: 'rgba(251, 164, 4, 0.2)',
    yellowT10: 'rgba(251, 164, 4, 0.1)',
    transparent: 'rgba(0, 0, 0, 0)',
  };