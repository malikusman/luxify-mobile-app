import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import * as Yup from 'yup';

interface SelectColorProps {
    initialValues: { favoriteColors: string[] };
    onSubmit: (values: { favoriteColors: string[] }) => void;
}

export interface SelectColorRef {
    submitForm: () => void;
}

const colorSchema = Yup.object().shape({
    favoriteColors: Yup.array().of(Yup.string()),
});

// Default color palette - 35 colors as shown in the image
const COLOR_PALETTE = [
    '#000000', // Black
    '#8B4513', // Brown
    '#FF6347', // Tomato/Orange-red
    '#FFA500', // Orange
    '#FFD700', // Gold
    '#FFFF00', // Yellow
    '#ADFF2F', // Green Yellow
    '#32CD32', // Lime Green
    '#00FF00', // Green
    '#00CED1', // Dark Turquoise
    '#00BFFF', // Deep Sky Blue
    '#0000FF', // Blue
    '#4169E1', // Royal Blue
    '#8A2BE2', // Blue Violet
    '#9370DB', // Medium Purple
    '#BA55D3', // Medium Orchid
    '#DA70D6', // Orchid
    '#FF00FF', // Magenta/Fuchsia
    '#FF1493', // Deep Pink
    '#FF69B4', // Hot Pink
    '#FFB6C1', // Light Pink
    '#FFC0CB', // Pink
    '#DC143C', // Crimson
    '#FF0000', // Red
    '#FFFFFF', // White
    '#F5F5DC', // Beige
    '#D3D3D3', // Light Grey
    '#808080', // Grey
    '#696969', // Dim Grey
    '#2F4F4F', // Dark Slate Grey
    '#000080', // Navy
    '#800080', // Purple
    '#4B0082', // Indigo
    '#FF8C00', // Dark Orange
    '#FF4500', // Orange Red
];

const SelectColor = forwardRef<SelectColorRef, SelectColorProps>(({ initialValues, onSubmit }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;

    const formikRef = React.useRef<FormikProps<any>>(null);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formikRef.current?.submitForm();
        },
    }));

    return (
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={colorSchema}
            onSubmit={onSubmit}
        >
            {({ values, setFieldValue, handleSubmit }) => {
                const toggleColor = (color: string) => {
                    const currentColors = values.favoriteColors || [];
                    if (currentColors.includes(color)) {
                        setFieldValue(
                            'favoriteColors',
                            currentColors.filter((c) => c !== color)
                        );
                    } else {
                        setFieldValue('favoriteColors', [...currentColors, color]);
                    }
                };

                const isSelected = (color: string) => {
                    return (values.favoriteColors || []).includes(color);
                };

                return (
                    <View style={styles.container}>
                        <View style={styles.topSection}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                Which colors do you like more?
                            </Text>
                        </View>

                        <ScrollView
                            style={styles.colorGridContainer}
                            contentContainerStyle={styles.colorGridContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.addColorButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.addColorButton, { backgroundColor: colors.surface }]}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        // Future: Open color picker modal
                                    }}
                                >
                                    <Ionicons name="add" size={scaleFontSize(24)} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.colorGrid}>
                                {COLOR_PALETTE.map((color, index) => {
                                    const selected = isSelected(color);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.colorSwatch,
                                                {
                                                    backgroundColor: color,
                                                    borderColor: selected ? colors.text : 'transparent',
                                                    borderWidth: selected ? 2 : 0,
                                                },
                                            ]}
                                            onPress={() => toggleColor(color)}
                                            activeOpacity={0.7}
                                        >
                                            {selected && (
                                                <View style={styles.checkmarkContainer}>
                                                    <View style={[styles.checkmarkCircle, { backgroundColor: colors.text }]}>
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={scaleFontSize(12)}
                                                            color={colors.background}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                );
            }}
        </Formik>
    );
});

SelectColor.displayName = 'SelectColor';

export default SelectColor;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(32),
    },
    title: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        textAlign: 'center',
    },
    colorGridContainer: {
        width: '100%',
        flex: 1,
    },
    colorGridContent: {
        alignItems: 'center',
        paddingBottom: scaleFontSize(20),
    },
    addColorButtonContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
    },
    addColorButton: {
        width: scaleFontSize(60),
        height: scaleFontSize(60),
        borderRadius: scaleFontSize(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: scaleFontSize(4),
    },
    colorSwatch: {
        width: scaleFontSize(50),
        height: scaleFontSize(50),
        borderRadius: scaleFontSize(8),
        margin: scaleFontSize(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkContainer: {
        position: 'absolute',
        top: scaleFontSize(4),
        right: scaleFontSize(4),
    },
    checkmarkCircle: {
        width: scaleFontSize(20),
        height: scaleFontSize(20),
        borderRadius: scaleFontSize(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
});
