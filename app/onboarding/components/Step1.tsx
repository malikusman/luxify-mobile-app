import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step1Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step1Icon from '@/src/components/icons/Step1Icon';

interface Step1Props {
    initialValues: { firstName: string; lastName: string };
    onSubmit: (values: { firstName: string; lastName: string }) => void;
}

export interface Step1Ref {
    submitForm: () => void;
}

const Step1 = forwardRef<Step1Ref, Step1Props>(({ initialValues, onSubmit }, ref) => {
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
            validationSchema={step1Schema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.step1Title}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.step1Subtitle}
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.iconContainer}>
                            <Step1Icon 
                                size={scaleFontSize(80)} 
                                color={colors.textSecondary} 
                                backgroundColor={colors.surface}
                            />
                        </View>

                        <CustomInput
                            placeholder={t.firstNamePlaceholder}
                            value={values.firstName}
                            onChangeText={handleChange('firstName')}
                            onBlur={handleBlur('firstName')}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="next"
                        />
                        {touched.firstName && errors.firstName && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.firstName}
                            </Text>
                        )}

                        <CustomInput
                            placeholder={t.lastNamePlaceholder}
                            value={values.lastName}
                            onChangeText={handleChange('lastName')}
                            onBlur={handleBlur('lastName')}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={() => handleSubmit()}
                        />
                        {touched.lastName && errors.lastName && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.lastName}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </Formik>
    );
});

Step1.displayName = 'Step1';

export default Step1;

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
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: -12,
        marginBottom: 8,
        paddingLeft: 4,
    },
});

