import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import * as Yup from 'yup';

interface SelectBodyHighlightAreasProps {
    initialValues: { bodyHighlightAreas: string[] };
    onSubmit: (values: { bodyHighlightAreas: string[] }) => void;
}

export interface SelectBodyHighlightAreasRef {
    submitForm: () => void;
}

const bodyHighlightAreasSchema = Yup.object().shape({
    bodyHighlightAreas: Yup.array().of(Yup.string()),
});

const BODY_HIGHLIGHT_OPTIONS = [
    'Legs',
    'Waist',
    'Bust',
    'Shoulders',
    'Curves',
    'Balance silhouette',
];

const SelectBodyHighlightAreas = forwardRef<SelectBodyHighlightAreasRef, SelectBodyHighlightAreasProps>(
    ({ initialValues, onSubmit }, ref) => {
        const colors = useThemeColors();
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                validationSchema={bodyHighlightAreasSchema}
                onSubmit={onSubmit}
            >
                {({ values, setFieldValue, handleSubmit }) => {
                    const toggleArea = (area: string) => {
                        const currentAreas = values.bodyHighlightAreas || [];
                        if (currentAreas.includes(area)) {
                            setFieldValue(
                                'bodyHighlightAreas',
                                currentAreas.filter((a) => a !== area)
                            );
                        } else {
                            setFieldValue('bodyHighlightAreas', [...currentAreas, area]);
                        }
                    };

                    const isSelected = (area: string) => {
                        return (values.bodyHighlightAreas || []).includes(area);
                    };

                    return (
                        <View style={styles.container}>
                            <View style={styles.topSection}>
                                <Text style={[styles.title, { color: colors.text }]}>
                                    Which areas of your body do you love to highlighting?
                                </Text>
                            </View>

                            <View style={styles.middleSection}>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownButton,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                                        Select Option
                                    </Text>
                                    <MaterialCommunityIcons
                                        name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                        size={scaleFontSize(24)}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>

                                <View style={styles.optionsContainer}>
                                    {BODY_HIGHLIGHT_OPTIONS.map((area) => {
                                        const selected = isSelected(area);
                                        return (
                                            <TouchableOpacity
                                                key={area}
                                                style={[
                                                    styles.optionButton,
                                                    {
                                                        backgroundColor: selected
                                                            ? colors.buttonPrimary
                                                            : colors.surface,
                                                        borderColor: selected
                                                            ? colors.buttonPrimary
                                                            : colors.border,
                                                    },
                                                ]}
                                                onPress={() => toggleArea(area)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        {
                                                            color: selected
                                                                ? colors.buttonText
                                                                : colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {area}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    );
                }}
            </Formik>
        );
    }
);

SelectBodyHighlightAreas.displayName = 'SelectBodyHighlightAreas';

export default SelectBodyHighlightAreas;

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
    middleSection: {
        width: '100%',
        flex: 1,
    },
    dropdownButton: {
        width: '100%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
    },
    dropdownButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    optionsContainer: {
        width: '100%',
        gap: scaleFontSize(12),
    },
    optionButton: {
        width: '100%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
    },
    optionText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});
