import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import { OCCASIONS } from '@/src/constants/constants';
import * as Yup from 'yup';

interface SelectOccasionProps {
    initialValues: { occasion: string };
    onSubmit: (values: { occasion: string }) => void;
}

export interface SelectOccasionRef {
    submitForm: () => void;
}

const occasionSchema = Yup.object().shape({
    occasion: Yup.string()
        .required('Occasion is required')
        .min(2, 'Occasion must be at least 2 characters'),
});

const SelectOccasion = forwardRef<SelectOccasionRef, SelectOccasionProps>(({ initialValues, onSubmit }, ref) => {
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
            validationSchema={occasionSchema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.selectOccasionTitle}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.selectOccasionSubtitle}
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                                <MaterialCommunityIcons
                                    name="calendar-check"
                                    size={scaleFontSize(40)}
                                    color={colors.textSecondary}
                                />
                            </View>
                        </View>

                        <CustomInput
                            placeholder={t.occasionPlaceholder}
                            value={values.occasion}
                            onChangeText={handleChange('occasion')}
                            onBlur={handleBlur('occasion')}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={() => handleSubmit()}
                        />
                        {touched.occasion && errors.occasion && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.occasion}
                            </Text>
                        )}

                        <Text style={[styles.orSelectText, { color: colors.textSecondary }]}>
                            {t.orSelectOne}
                        </Text>

                        <FlatList
                            data={OCCASIONS}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.optionsContainer}
                            keyExtractor={(item) => item}
                            renderItem={({ item: option }) => {
                                const isSelected = values.occasion === option;
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
                                            setFieldValue('occasion', option);
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
                    </View>
                </View>
            )}
        </Formik>
    );
});

SelectOccasion.displayName = 'SelectOccasion';

export default SelectOccasion;

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
        paddingHorizontal: scaleFontSize(4),
    },
    optionButton: {
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        marginRight: scaleFontSize(8),
        minWidth: scaleFontSize(80),
    },
    optionText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        textAlign: 'center',
    },
});

