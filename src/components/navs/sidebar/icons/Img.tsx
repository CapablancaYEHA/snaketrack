import { FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
}

export const ImgIcon: FC<IIcon> = ({ width, height }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 64 64" fill="none" preserveAspectRatio="xMidYMid meet">
    <g id="Layer_1">
      <g class="st1" opacity={0.2}>
        <g>
          <polygon class="st2" points="48,26 48,18 16,18 16,26 16,50 48,50  " fill="#231F20" />
        </g>
        <g>
          <path class="st2" d="M48,14H16c-2.2,0-4,1.8-4,4v8v24c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V26v-8C52,15.8,50.2,14,48,14z" fill="#231F20" />
        </g>
      </g>
      <g>
        <g>
          <path class="st3" d="M16,50c-1.1,0-2-0.9-2-2V16c0-1.1,0.9-2,2-2h32c1.1,0,2,0.9,2,2v32c0,1.1-0.9,2-2,2H16z" fill="#77B3D4" />
        </g>
        <g>
          <path class="st4" d="M48,16v8v24H16V24v-8H48 M48,12H16c-2.2,0-4,1.8-4,4v8v24c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V24v-8     C52,13.8,50.2,12,48,12L48,12z" fill="#FFFFFF" />
        </g>
      </g>
      <g>
        <rect x="16" y="44" class="st4" width="32" height="4" fill="#FFFFFF" />
      </g>
      <g>
        <g>
          <path class="st5" d="M14,44h34.9v-2.9c0,0-1.7-3-3.3-4.8c-1.2-1.4-2.9-1.8-4.5-0.1l-2.8,2.6l-6-7.6c-2.2-2.8-5.9-2.8-8.1,0L14,44     z" fill="#4F5D73" />
        </g>
      </g>
      <g>
        <circle class="st6" cx="40" cy="24" r="3" fill="#F5CF87" />
      </g>
      <g>
        <path class="st4" d="M48,16v8v24H16V24v-8H48 M48,12H16c-2.2,0-4,1.8-4,4v8v24c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V24v-8    C52,13.8,50.2,12,48,12L48,12z" fill="#FFFFFF" />
      </g>
    </g>
  </svg>
);
