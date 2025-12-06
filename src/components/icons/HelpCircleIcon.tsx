import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HelpCircleIconProps {
    size?: number;
    color?: string;
}

export default function HelpCircleIcon({ size = 20, color = 'black' }: HelpCircleIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <Path
                d="M6.89648 6.82361C7.06728 6.29732 7.38015 5.82896 7.80078 5.46948C8.22141 5.11001 8.7338 4.87378 9.28027 4.78708C9.82675 4.70038 10.3862 4.7664 10.8975 4.97803C11.4087 5.18966 11.8514 5.53875 12.1768 5.98633C12.5021 6.43391 12.6969 6.96256 12.7404 7.51416C12.7839 8.06576 12.6738 8.61879 12.4227 9.11182C12.1715 9.60484 11.7894 10.0185 11.3176 10.3076C10.8458 10.5967 10.3033 10.7498 9.75 10.7498V11.7502M9.75 18.75C4.77944 18.75 0.75 14.7206 0.75 9.75C0.75 4.77944 4.77944 0.75 9.75 0.75C14.7206 0.75 18.75 4.77944 18.75 9.75C18.75 14.7206 14.7206 18.75 9.75 18.75ZM9.7998 14.75V14.85L9.7002 14.8502V14.75H9.7998Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

