import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import * as Yup from 'yup';
import type { QuestionnaireOption } from '@/src/services/modules/options/questionnaireTypes';

export interface SelectQuestionOptionRef {
    submitForm: () => void;
}

interface SelectQuestionOptionProps {
    title: string;
    options: QuestionnaireOption[];
    multiple: boolean;
    fieldName: string;
    initialValues: { [key: string]: string | string[] };
    onSubmit: (values: { [key: string]: string | string[] }) => void;
}

const SelectQuestionOption = forwardRef<SelectQuestionOptionRef, SelectQuestionOptionProps>(
    ({ title, options, multiple, fieldName, initialValues, onSubmit }, ref) => {
        const colors = useThemeColors();
        const formikRef = React.useRef<FormikProps<any>>(null);

        const schema = Yup.object().shape({
            [fieldName]: multiple
                ? Yup.array().of(Yup.string())
                : Yup.string().required('Please select an option'),
        });

        useImperativeHandle(ref, () => ({
            submitForm: () => {
                formikRef.current?.submitForm();
            },
        }));

        if (!options || options.length === 0) {
            return (
                <View style={styles.container}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No options available.
                    </Text>
                </View>
            );
        }

        return (
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ values, setFieldValue, errors, touched }) => {
                    const currentValue = values[fieldName];
                    const selectedValues = multiple
                        ? (Array.isArray(currentValue) ? currentValue : [])
                        : [currentValue].filter(Boolean);

                    const toggle = (optionValue: string) => {
                        if (multiple) {
                            const arr = Array.isArray(currentValue) ? [...currentValue] : [];
                            if (arr.includes(optionValue)) {
                                setFieldValue(fieldName, arr.filter((v) => v !== optionValue));
                            } else {
                                setFieldValue(fieldName, [...arr, optionValue]);
                            }
                        } else {
                            setFieldValue(fieldName, optionValue);
                        }
                    };

                    const isSelected = (optionValue: string) => {
                        if (multiple && Array.isArray(currentValue)) {
                            return currentValue.includes(optionValue);
                        }
                        return currentValue === optionValue;
                    };

                    return (
                        <View style={styles.container}>
                            <View style={styles.topSection}>
                                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                            </View>
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.optionsContainer}
                                showsVerticalScrollIndicator={false}
                            >
                                {options.map((opt) => {
                                    const selected = isSelected(opt.value);
                                    return (
                                        <TouchableOpacity
                                            key={opt.value}
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
                                            onPress={() => toggle(opt.value)}
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
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                            {touched[fieldName] && errors[fieldName] && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors[fieldName] as string}
                                </Text>
                            )}
                        </View>
                    );
                }}
            </Formik>
        );
    }
);

SelectQuestionOption.displayName = 'SelectQuestionOption';

export default SelectQuestionOption;

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
        textAlign: 'center',
        paddingHorizontal: scaleFontSize(8),
    },
    scrollView: {
        width: '100%',
        flex: 1,
    },
    optionsContainer: {
        paddingBottom: scaleFontSize(20),
        gap: scaleFontSize(12),
    },
    optionButton: {
        width: '100%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        marginBottom: scaleFontSize(8),
    },
    optionText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
        paddingLeft: 4,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginTop: scaleFontSize(16),
    },
});
