import React from 'react';
import { View, Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';

interface StylistImageCardProps {
    source: ImageSourcePropType;
    width: number;
    height: number;
    rotation?: number;
    style?: any;
}

export default function StylistImageCard({
    source,
    width,
    height,
    rotation = 0,
    style,
}: StylistImageCardProps) {
    const colors = useThemeColors();
    
    return (
        <View
            style={[
                styles.container,
                {
                    width: scaleFontSize(width),
                    height: scaleFontSize(height),
                    transform: [{ rotate: `${rotation}deg` }],
                },
                style,
            ]}
        >
            <View style={[styles.backgroundCard, { backgroundColor: "#E7E8E9"}]}>
                <View style={styles.shadowContainer}>
                    <Image
                        source={source}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundCard: {
        width: '100%',
        height: '100%',
        borderRadius: scaleFontSize(20),
        padding: scaleFontSize(8)
    },
    shadowContainer: {
        flex: 1,
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: scaleFontSize(12),
    },
});

