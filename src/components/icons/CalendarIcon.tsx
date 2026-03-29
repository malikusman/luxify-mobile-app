import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CalendarIconProps {
    size?: number;
    color?: string;
}

export default function CalendarIcon({ size = 18, color = 'white' }: CalendarIconProps) {
    return (
        <Svg width={size} height={size * (20/18)} viewBox="0 0 18 20" fill="none">
            <Path
                d="M1 7H17M1 7V15.8002C1 16.9203 1 17.4801 1.21799 17.9079C1.40973 18.2842 1.71547 18.5905 2.0918 18.7822C2.5192 19 3.07899 19 4.19691 19H13.8031C14.921 19 15.48 19 15.9074 18.7822C16.2837 18.5905 16.5905 18.2842 16.7822 17.9079C17 17.4805 17 16.9215 17 15.8036V7M1 7V6.2002C1 5.08009 1 4.51962 1.21799 4.0918C1.40973 3.71547 1.71547 3.40973 2.0918 3.21799C2.51962 3 3.08009 3 4.2002 3H5M17 7V6.19691C17 5.07899 17 4.5192 16.7822 4.0918C16.5905 3.71547 16.2837 3.40973 15.9074 3.21799C15.4796 3 14.9203 3 13.8002 3H13M13 1V3M13 3H5M5 1V3"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

