import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SendIconProps {
    size?: number;
    color?: string;
}

export default function SendIcon({ size = 12, color = '#A6A6A6' }: SendIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
            <Path
                d="M11 6L1 6"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6 11L11 6L6 0.999999"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

