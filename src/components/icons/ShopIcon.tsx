import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ShopIconProps {
    size?: number;
    color?: string;
}

export default function ShopIcon({ size = 24, color = 'black' }: ShopIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M4 9H20L19.1654 18.1811C19.0717 19.2112 18.208 20 17.1736 20H6.82643C5.79202 20 4.92829 19.2112 4.83464 18.1811L4 9Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <Path
                d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </Svg>
    );
}

