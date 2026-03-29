import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ShopmodeIconProps {
    size?: number;
    color?: string;
}

export default function ShopmodeIcon({ size = 20, color = '#A6A6A6' }: ShopmodeIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <Path
                d="M10 2L10.0012 5.16941C10.0019 6.95048 12.155 7.84232 13.4149 6.5834L15.6569 4.34315L13.4166 6.58512C12.1577 7.84501 13.0495 9.9981 14.8306 9.99879L18 10L14.8306 10.0012C13.0495 10.0019 12.1577 12.155 13.4166 13.4149L15.6569 15.6569L13.4149 13.4166C12.155 12.1577 10.0019 13.0495 10.0012 14.8306L10 18L9.99879 14.8306C9.9981 13.0495 7.845 12.1577 6.58511 13.4166L4.34315 15.6569L6.5834 13.4149C7.84232 12.155 6.95048 10.0019 5.16941 10.0012L2 10L5.16941 9.99879C6.95048 9.9981 7.84232 7.845 6.5834 6.58511L4.34315 4.34315L6.58512 6.5834C7.84501 7.84232 9.9981 6.95048 9.99879 5.16941L10 2Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M13 7L7 13"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

