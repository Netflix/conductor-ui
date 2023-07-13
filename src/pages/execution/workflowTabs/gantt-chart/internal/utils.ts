import { fontFamily, fontSizes } from "../../../../../theme/variables";

export const getClientY = (event: React.MouseEvent<SVGSVGElement>) =>
  event.clientY;

export const getClientX = (event: React.MouseEvent<SVGSVGElement>) =>
  event.clientX;

export const getTextWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font = `${fontSizes.fontSize3} ${fontFamily.fontFamilySans}`,
) => {
  if (ctx) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }
};

export const smartTimeFormat = (
  time: string | number,
  axisTicks: boolean = false,
) => {
  let ms: number = 0;
  if (typeof time === "string") {
    ms = parseInt(time);
  } else {
    ms = time;
  }
  const [years, yearsms] = [Math.floor(ms / 31556926000), ms % 31556926000];
  const [months, monthsms] = [
    Math.floor(yearsms / (24 * 60 * 60 * 1000 * 30.4375)),
    ms % (24 * 60 * 60 * 1000 * 30.4375),
  ];
  const [days, daysms] = [
    Math.floor(monthsms / (24 * 60 * 60 * 1000)),
    ms % (24 * 60 * 60 * 1000),
  ];
  const [hours, hoursms] = [
    Math.floor(daysms / (60 * 60 * 1000)),
    ms % (60 * 60 * 1000),
  ];
  const [minutes, minutesms] = [
    Math.floor(hoursms / (60 * 1000)),
    ms % (60 * 1000),
  ];
  const [secs, secsms] = [Math.floor(minutesms / 1000), ms % 1000];
  const millis = Math.floor(secsms);
  let precision = 2;
  let strYears = precision && years ? `${years}yrs ` : "";
  strYears && precision--;
  let strMonths = precision && months ? `${months}mos ` : "";
  strMonths && precision--;
  let strDays = precision && days ? `${days}days ` : "";
  strDays && precision--;
  let strHours = precision && hours ? `${hours}hrs ` : "";
  strHours && precision--;
  let strMins = precision && minutes ? `${minutes}mins ` : "";
  strMins && precision--;
  let strSecs = precision && secs ? `${secs}s ` : "";
  strSecs && precision--;
  let strMilliSecs = precision && millis ? `${millis}ms ` : "";
  strMilliSecs && precision--;
  let label =
    strYears +
    strMonths +
    strDays +
    strHours +
    strMins +
    strSecs +
    strMilliSecs;
  if (axisTicks) {
    if (years) {
      return "MMMM YYYY";
    } else if (months) {
      return "MMMM D, YYYY";
    } else if (days) {
      return "MMMM D";
    } else if (hours) {
      return "h:mm:ss A";
    } else if (minutes) {
      return "hh:mm:ss";
    }
    return "hh:mm:ss:SSS";
  }
  return label || `0ms`;
};
