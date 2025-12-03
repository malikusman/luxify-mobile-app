import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/theme/Colors';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                const isFirst = index === 0;
                const isLast = index === totalSteps - 1;

                return (
                    <View
                        key={stepNumber}
                        style={[
                            styles.step,
                            {
                                backgroundColor: isCompleted || isCurrent
                                    ? colors.buttonPrimary
                                    : colors.divider,
                                borderTopLeftRadius: isFirst ? 2 : 0,
                                borderBottomLeftRadius: isFirst ? 2 : 0,
                                borderTopRightRadius: isLast ? 2 : 0,
                                borderBottomRightRadius: isLast ? 2 : 0,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
    },
    step: {
        flex: 1,
        height: 4,
        borderRadius: 0,
    },
});

