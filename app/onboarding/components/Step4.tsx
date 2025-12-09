import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step4Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step4Icon from '@/src/components/icons/Step4Icon';
import { BRANDS, LIMITS } from '@/src/constants/constants';

interface Step4Props {
    initialValues: { selectedBrands: string[] };
    onSubmit: (values: { selectedBrands: string[] }) => void;
}

export interface Step4Ref {
    submitForm: () => void;
}

const Step4 = forwardRef<Step4Ref, Step4Props>(({ initialValues, onSubmit }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [searchQuery, setSearchQuery] = useState('');
    const formikRef = React.useRef<FormikProps<any>>(null);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formikRef.current?.submitForm();
        },
    }));

    const filteredBrands = BRANDS.filter((brand) =>
        brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={step4Schema}
            onSubmit={onSubmit}
        >
            {({ values, setFieldValue, errors, touched, handleSubmit }) => {
                const toggleBrand = (brand: string) => {
                    const currentBrands = values.selectedBrands;
                    if (currentBrands.includes(brand)) {
                        setFieldValue(
                            'selectedBrands',
                            currentBrands.filter((b) => b !== brand)
                        );
                    } else {
                        setFieldValue('selectedBrands', [...currentBrands, brand]);
                    }
                };

                const isSelected = (brand: string) => values.selectedBrands.includes(brand);
                const hasMinimumBrands = values.selectedBrands.length >= LIMITS.MIN_BRANDS;

                return (
                    <View style={styles.container}>
                        <View style={styles.topSection}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {t.step4Title}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t.step4Subtitle}
                            </Text>
                        </View>

                        <View style={styles.middleSection}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                                    <Step4Icon size={scaleFontSize(40)} color={colors.textSecondary} />
                                </View>
                            </View>

                            <CustomInput
                                placeholder={t.findBrands}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                                icon={
                                    <Ionicons
                                        name="search-outline"
                                        size={scaleFontSize(20)}
                                        color={searchQuery ? colors.text : colors.textSecondary}
                                    />
                                }
                            />

                            <ScrollView
                                style={styles.brandList}
                                showsVerticalScrollIndicator={false}
                            >
                                {filteredBrands.map((brand) => {
                                    const selected = isSelected(brand);
                                    return (
                                        <TouchableOpacity
                                            key={brand}
                                            style={[
                                                styles.brandItem,
                                                {
                                                    backgroundColor: selected
                                                        ? colors.buttonPrimary
                                                        : colors.surface,
                                                },
                                            ]}
                                            onPress={() => toggleBrand(brand)}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.brandText,
                                                    {
                                                        color: selected
                                                            ? colors.buttonText
                                                            : colors.text,
                                                    },
                                                ]}
                                            >
                                                {brand}
                                            </Text>
                                            <Ionicons
                                                name={selected ? 'heart' : 'heart-outline'}
                                                size={scaleFontSize(20)}
                                                color={selected ? colors.buttonText : colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {!hasMinimumBrands ? (
                                <View style={[styles.hintContainer, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                                        {t.likeAtLeast3Brands}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.hintContainer}>
                                    <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                                        {values.selectedBrands.length} brands selected
                                    </Text>
                                </View>
                            )}

                            {touched.selectedBrands && errors.selectedBrands && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors.selectedBrands}
                                </Text>
                            )}
                        </View>
                    </View>
                );
            }}
        </Formik>
    );
});

Step4.displayName = 'Step4';

export default Step4;

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
    brandList: {
        width: '100%',
        maxHeight: 300,
        marginTop: scaleFontSize(16),
        marginBottom: scaleFontSize(16),
    },
    brandItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        marginBottom: scaleFontSize(8),
        borderRadius: 4,
    },
    brandText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    hintContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: 4,
        marginTop: scaleFontSize(8),
    },
    hintText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: 8,
        paddingLeft: 4,
        textAlign: 'center',
    },
});

