import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step3Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step3Icon from '@/src/components/icons/Step3Icon';

interface Step3Props {
    initialValues: { occupation: string };
    onSubmit: (values: { occupation: string }) => void;
}

export interface Step3Ref {
    submitForm: () => void;
}

const OCCUPATION_OPTIONS = ['Lawyer', 'Marketing lead', 'Software Engineer'];

const Step3 = forwardRef<Step3Ref, Step3Props>(({ initialValues, onSubmit }, ref) => {
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
                            placeholder={t.occupationPlaceholder}
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

                        <View style={styles.optionsContainer}>
                            {OCCUPATION_OPTIONS.map((option) => {
                                const isSelected = values.occupation === option;
                                return (
                                    <TouchableOpacity
                                        key={option}
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
                            })}
                        </View>
                    </View>
                </View>
            )}
        </Formik>
    );
});

Step3.displayName = 'Step3';

export default Step3;

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
    optionsContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    optionButton: {
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: 4,
        borderWidth: 1,
        minWidth: 100,
    },
    optionText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        textAlign: 'center',
    },
});

