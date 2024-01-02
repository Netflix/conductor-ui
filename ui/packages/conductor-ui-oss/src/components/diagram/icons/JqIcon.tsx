import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

export default function JqIcon(
  props: SvgIconProps,
): React.ReactElement<SvgIconProps> {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
        <g
          transform="matrix(0.1, 0, 0, 0.1, 0, 0)"
          strokeWidth="10"
          fill="currentColor"
        >
          <g>
            <circle cx="220" cy="1570" r="190" />
            <path d="m1330 312c-30 41-698 1492-710 1528s25 66 100 101c77 36 102 34 124 3s701-1477 716-1525c15-47-20-73-84-104s-116-44-146-3z" />
          </g>
          <g>
            <circle cx="2410" cy="200" r="190" />
            <path d="m1830 655c0 129 0 130 70 130h360v423c0 246-5 474-10 506-19 112-88 176-190 176-59 0-120-27-147-66-51-73-65-84-99-84-31 0-40 8-104 93-84 111-86 129-32 189 227 252 692 187 836-118 53-112 56-153 56-795v-514c0-64-30-100-100-100h-490c-149 0-150 0-150 160zM2867 1233c30 302 250 499 438 527 144 19 244 0 375-90v410c0 81 0 100 150 100 136 0 150-20 150-150v-1420c0-99-19-100-150-100s-139 15-139 82c-103-89-351-149-523-49s-342 278-301 690zm803-107c0 292-105 356-237 356-178 0-249-147-273-296-27-168 25-420 262-420 171 0 248 89 248 360z" />
          </g>
        </g>
      </svg>
    </SvgIcon>
  );
}