import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import * as Yup from 'yup';

interface SelectGenderProps {
    initialValues: { gender: string };
    onSubmit: (values: { gender: string }) => void;
}

export interface SelectGenderRef {
    submitForm: () => void;
}

const genderSchema = Yup.object().shape({
    gender: Yup.string()
        .required('Please select a gender')
        .oneOf(['Female', 'Male'], 'Please select a valid gender'),
});

const SelectGender = forwardRef<SelectGenderRef, SelectGenderProps>(({ initialValues, onSubmit }, ref) => {
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
            validationSchema={genderSchema}
            onSubmit={onSubmit}
        >
            {({ handleSubmit, values, errors, touched, setFieldValue }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.selectGenderTitle}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.selectGenderSubtitle}
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.genderOptionsContainer}>
                            <TouchableOpacity
                                style={styles.genderOption}
                                onPress={() => setFieldValue('gender', 'Female')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.genderLabel, { color: colors.text }]}>Female</Text>
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={require('@/assets/female.png')}
                                        style={styles.genderImage}
                                        resizeMode="cover"
                                    />
                                    {values.gender === 'Female' && (
                                        <View style={[styles.checkmarkContainer, { backgroundColor: colors.buttonPrimary }]}>
                                            <Ionicons name="checkmark" size={scaleFontSize(20)} color={colors.buttonText} />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.genderOption}
                                onPress={() => setFieldValue('gender', 'Male')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.genderLabel, { color: colors.text }]}>Male</Text>
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={require('@/assets/male.png')}
                                        style={styles.genderImage}
                                        resizeMode="cover"
                                    />
                                    {values.gender === 'Male' && (
                                        <View style={[styles.checkmarkContainer, { backgroundColor: colors.buttonPrimary }]}>
                                            <Ionicons name="checkmark" size={scaleFontSize(20)} color={colors.buttonText} />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {touched.gender && errors.gender && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.gender}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </Formik>
    );
});

SelectGender.displayName = 'SelectGender';

export default SelectGender;

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
        alignItems: 'flex-start',
        marginTop: scaleFontSize(32),
    },
    genderOptionsContainer: {
        width: '100%',
        gap: scaleFontSize(20),
    },
    genderOption: {
        width: '100%',
    },
    genderLabel: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
        marginBottom: scaleFontSize(12),
    },
    imageContainer: {
        width: '100%',
        position: 'relative',
    },
    genderImage: {
        width: '100%',
        height: scaleFontSize(240),
        borderRadius: scaleFontSize(8),
    },
    checkmarkContainer: {
        position: 'absolute',
        top: scaleFontSize(12),
        left: scaleFontSize(12),
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(12),
        paddingLeft: 4,
        textAlign: 'center',
    },
});

