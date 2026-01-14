import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChatIconProps {
    size?: number;
    color?: string;
}

export default function ChatIcon({ size = 18, color = 'black' }: ChatIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
            <Path
                d="M9 1.5C4.85775 1.5 1.5 4.392 1.5 8.025C1.5 9.6825 2.2275 11.16 3.375 12.2025L2.25 16.5L6.75 15.4125C7.7475 15.75 8.8575 15.975 9 15.975C13.1423 15.975 16.5 13.083 16.5 9.45C16.5 5.817 13.1423 1.5 9 1.5Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

