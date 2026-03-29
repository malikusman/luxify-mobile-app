import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step3Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step3Icon from '@/src/components/icons/Step3Icon';
import { useOccupations } from '@/src/services/modules/options/optionsHooks';

interface SelectOccupationProps {
    initialValues: { occupation: string };
    onSubmit: (values: { occupation: string }) => void;
}

export interface SelectOccupationRef {
    submitForm: () => void;
}

const SelectOccupation = forwardRef<SelectOccupationRef, SelectOccupationProps>(({ initialValues, onSubmit }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const { data: occupations = [], isLoading, isError } = useOccupations();
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
            validationSchema={step3Schema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.step3Title}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.step3Subtitle}
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                                <Step3Icon size={scaleFontSize(40)} color={colors.textSecondary} />
                            </View>
                        </View>

                        <CustomInput
                            placeholder={t.occupationPlaceholder || 'Type your Occupation'}
                            value={values.occupation}
                            onChangeText={handleChange('occupation')}
                            onBlur={handleBlur('occupation')}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={() => handleSubmit()}
                        />
                        {touched.occupation && errors.occupation && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.occupation}
                            </Text>
                        )}

                        <Text style={[styles.orSelectText, { color: colors.textSecondary }]}>
                            {t.orSelectOne}
                        </Text>

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

                        {isDropdownOpen && (
                            <View style={styles.dropdownContainer}>
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color={colors.buttonPrimary} />
                                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                            Loading occupations...
                                        </Text>
                                    </View>
                                ) : isError ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={[styles.errorText, { color: colors.error }]}>
                                            Failed to load occupations. Please try again.
                                        </Text>
                                    </View>
                                ) : occupations.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                            No occupations available.
                                        </Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={occupations}
                                        contentContainerStyle={styles.optionsContainer}
                                        keyExtractor={(item) => item}
                                        renderItem={({ item: option }) => {
                                            const isSelected = values.occupation === option;
                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.optionButton,
                                                        {
                                                            backgroundColor: isSelected
                                                                ? colors.buttonPrimary
                                                                : colors.surface,
                                                            borderColor: isSelected
                                                                ? colors.buttonPrimary
                                                                : colors.border,
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        setFieldValue('occupation', option);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.optionText,
                                                            {
                                                                color: isSelected
                                                                    ? colors.buttonText
                                                                    : colors.text,
                                                            },
                                                        ]}
                                                    >
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            )}
        </Formik>
    );
});

SelectOccupation.displayName = 'SelectOccupation';

export default SelectOccupation;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(40),
    },
    title: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    middleSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: scaleFontSize(32),
    },
    iconContainer: {
        marginBottom: scaleFontSize(32),
    },
    iconCircle: {
        width: scaleFontSize(80),
        height: scaleFontSize(80),
        borderRadius: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: -12,
        marginBottom: 8,
        paddingLeft: 4,
    },
    orSelectText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(16),
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
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
        marginBottom: scaleFontSize(8),
    },
    dropdownButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    dropdownContainer: {
        width: '100%',
        marginTop: scaleFontSize(8),
        maxHeight: scaleFontSize(300),
    },
    optionsContainer: {
        paddingHorizontal: scaleFontSize(4),
        width: '100%',
    },
    optionButton: {
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        marginBottom: scaleFontSize(8),
        width: '100%',
    },
    optionText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        textAlign: 'center',
    },
    loadingContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
        textAlign: 'center',
    },
    errorContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(16),
    },
    emptyContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(16),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});

