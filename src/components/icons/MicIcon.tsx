import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface MicIconProps {
    size?: number;
    color?: string;
}

export default function MicIcon({ size = 24, color = 'white' }: MicIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect
                x="9"
                y="3"
                width="6"
                height="11"
                rx="3"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M19 11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M12 18V21"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

