import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Step1IconProps {
    size?: number;
    color?: string;
    backgroundColor?: string;
}

export default function Step1Icon({ size = 114, color = '#979C9E', backgroundColor = '#F2F4F5' }: Step1IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 114 114" fill="none">
            <Circle cx="57" cy="57" r="57" fill={backgroundColor} />
            <Path
                d="M71 75C71 67.268 64.732 61 57 61C49.268 61 43 67.268 43 75M57 55C52.5817 55 49 51.4183 49 47C49 42.5817 52.5817 39 57 39C61.4183 39 65 42.5817 65 47C65 51.4183 61.4183 55 57 55Z"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

