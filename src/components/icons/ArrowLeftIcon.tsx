import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowLeftIconProps {
    size?: number;
    color?: string;
}

export default function ArrowLeftIcon({ size = 12, color = '#A6A6A6' }: ArrowLeftIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
            <Path
                d="M1 6L11 6"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6 11L1 6L6 0.999999"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

