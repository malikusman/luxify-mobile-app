import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Step4IconProps {
    size?: number;
    color?: string;
}

export default function Step4Icon({ size = 36, color = '#979C9E' }: Step4IconProps) {
    const aspectRatio = 36 / 40;
    const width = size;
    const height = size / aspectRatio;

    return (
        <Svg width={width} height={height} viewBox="0 0 36 40" fill="none">
            <Path
                d="M4 28H32V36C32 37.1046 31.1046 38 30 38H6C4.89543 38 4 37.1046 4 36V28Z"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <Path
                d="M2 10H34V26C34 27.1046 33.1046 28 32 28H4C2.89543 28 2 27.1046 2 26V10Z"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <Path
                d="M12 4C12 2.89543 12.8954 2 14 2H22C23.1046 2 24 2.89543 24 4V10H12V4Z"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

