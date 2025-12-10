import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step2Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step2Icon from '@/src/components/icons/Step2Icon';

interface Step2Props {
    initialValues: { email: string };
    onSubmit: (values: { email: string }) => void;
}

export interface Step2Ref {
    submitForm: () => void;
}

const Step2 = forwardRef<Step2Ref, Step2Props>(({ initialValues, onSubmit }, ref) => {
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
            validationSchema={step2Schema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.step2Title}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.step2Subtitle}
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                                <Step2Icon size={scaleFontSize(40)} color={colors.textSecondary} />
                            </View>
                        </View>

                        <CustomInput
                            placeholder={t.emailPlaceholder}
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={() => handleSubmit()}
                            icon={
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={scaleFontSize(20)}
                                    color={values.email ? colors.text : colors.textSecondary}
                                />
                            }
                        />
                        {touched.email && errors.email && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.email}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </Formik>
    );
});

Step2.displayName = 'Step2';

export default Step2;

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
});

