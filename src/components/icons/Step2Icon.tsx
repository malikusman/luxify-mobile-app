import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Step2IconProps {
    size?: number;
    color?: string;
}

export default function Step2Icon({ size = 39, color = '#979C9E' }: Step2IconProps) {
    const aspectRatio = 39 / 31;
    const width = size;
    const height = size / aspectRatio;

    return (
        <Svg width={width} height={height} viewBox="0 0 39 31" fill="none">
            <Path
                d="M3.5 3.5L15.7153 12.7245L15.7193 12.7279C17.0757 13.7226 17.7543 14.2202 18.4975 14.4124C19.1545 14.5823 19.845 14.5823 20.502 14.4124C21.2459 14.22 21.9264 13.7209 23.2852 12.7245C23.2852 12.7245 31.1202 6.71188 35.5 3.5M1.5 23.1004V7.90039C1.5 5.66018 1.5 4.53924 1.93597 3.68359C2.31947 2.93095 2.93095 2.31947 3.68359 1.93597C4.53924 1.5 5.66018 1.5 7.90039 1.5H31.1004C33.3406 1.5 34.4591 1.5 35.3148 1.93597C36.0674 2.31947 36.681 2.93095 37.0645 3.68359C37.5 4.5384 37.5 5.65799 37.5 7.89382V23.1072C37.5 25.343 37.5 26.461 37.0645 27.3158C36.681 28.0684 36.0674 28.681 35.3148 29.0645C34.46 29.5 33.342 29.5 31.1062 29.5H7.89382C5.65799 29.5 4.5384 29.5 3.68359 29.0645C2.93095 28.681 2.31947 28.0684 1.93597 27.3158C1.5 26.4601 1.5 25.3406 1.5 23.1004Z"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

