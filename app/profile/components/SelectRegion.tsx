import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import * as Yup from 'yup';

interface SelectRegionProps {
    initialValues: { region: string };
    onSubmit: (values: { region: string }) => void;
}

export interface SelectRegionRef {
    submitForm: () => void;
}

const regionSchema = Yup.object().shape({
    region: Yup.string()
        .required('Please select a region')
        .min(2, 'Region must be at least 2 characters'),
});

// List of countries with their flag emojis
const COUNTRIES = [
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Spain', flag: '🇪🇸' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Italy', flag: '🇮🇹' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'China', flag: '🇨🇳' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Netherlands', flag: '🇳🇱' },
    { name: 'Sweden', flag: '🇸🇪' },
    { name: 'Norway', flag: '🇳🇴' },
    { name: 'Denmark', flag: '🇩🇰' },
    { name: 'Switzerland', flag: '🇨🇭' },
    { name: 'Belgium', flag: '🇧🇪' },
    { name: 'Austria', flag: '🇦🇹' },
    { name: 'Poland', flag: '🇵🇱' },
    { name: 'Greece', flag: '🇬🇷' },
    { name: 'Turkey', flag: '🇹🇷' },
    { name: 'Russia', flag: '🇷🇺' },
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Chile', flag: '🇨🇱' },
    { name: 'Colombia', flag: '🇨🇴' },
    { name: 'Peru', flag: '🇵🇪' },
    { name: 'South Africa', flag: '🇿🇦' },
    { name: 'Egypt', flag: '🇪🇬' },
    { name: 'Saudi Arabia', flag: '🇸🇦' },
    { name: 'United Arab Emirates', flag: '🇦🇪' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'Thailand', flag: '🇹🇭' },
    { name: 'Indonesia', flag: '🇮🇩' },
    { name: 'Malaysia', flag: '🇲🇾' },
    { name: 'Philippines', flag: '🇵🇭' },
    { name: 'Vietnam', flag: '🇻🇳' },
    { name: 'New Zealand', flag: '🇳🇿' },
];

const SelectRegion = forwardRef<SelectRegionRef, SelectRegionProps>(({ initialValues, onSubmit }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [searchQuery, setSearchQuery] = useState('');

    const formikRef = React.useRef<FormikProps<any>>(null);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formikRef.current?.submitForm();
        },
    }));

    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) {
            return COUNTRIES;
        }
        const query = searchQuery.toLowerCase();
        return COUNTRIES.filter(
            (country) => country.name.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    return (
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={regionSchema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Select Your Region
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Enter your location to find them
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <CustomInput
                            placeholder="Miami"
                            value={values.region || searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                setFieldValue('region', '');
                            }}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="search"
                        />

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.name}
                            style={styles.countryList}
                            contentContainerStyle={styles.countryListContent}
                            showsVerticalScrollIndicator={true}
                            renderItem={({ item }) => {
                                const isSelected = values.region === item.name;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.countryItem,
                                            {
                                                backgroundColor: isSelected
                                                    ? colors.surface
                                                    : 'transparent',
                                            },
                                        ]}
                                        onPress={() => {
                                            setFieldValue('region', item.name);
                                            setSearchQuery('');
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.flag}>{item.flag}</Text>
                                        <Text style={[styles.countryName, { color: colors.text }]}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {touched.region && errors.region && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.region}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </Formik>
    );
});

SelectRegion.displayName = 'SelectRegion';

export default SelectRegion;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
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
        flex: 1,
    },
    countryList: {
        width: '100%',
        marginTop: scaleFontSize(16),
        maxHeight: scaleFontSize(400),
    },
    countryListContent: {
        paddingBottom: scaleFontSize(16),
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        marginBottom: scaleFontSize(4),
    },
    flag: {
        fontSize: scaleFontSize(24),
        marginRight: scaleFontSize(12),
    },
    countryName: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        flex: 1,
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
