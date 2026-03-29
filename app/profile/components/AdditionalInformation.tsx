import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import * as Yup from 'yup';

interface AdditionalInformationProps {
    initialValues: {
        dateOfBirth: string;
        height: string;
        size: string;
        budgetRange: string;
        bodyType: string;
        waist: string;
        hips: string;
        shoulders: string;
        chest: string;
    };
    onSubmit: (values: AdditionalInformationProps['initialValues']) => void;
}

export interface AdditionalInformationRef {
    submitForm: () => void;
}

const additionalInfoSchema = Yup.object().shape({
    dateOfBirth: Yup.string(),
    height: Yup.string(),
    size: Yup.string(),
    budgetRange: Yup.string(),
    bodyType: Yup.string(),
    waist: Yup.string(),
    hips: Yup.string(),
    shoulders: Yup.string(),
    chest: Yup.string(),
});

const SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const BODY_SHAPES = ['Curvy waist', 'Pear Shape', 'Rectangle', 'Apple', 'Hourglass', 'Inverted Triangle'];

// Simple date picker component
const DatePickerBottomSheet = ({
    visible,
    onClose,
    onSelect,
    selectedDate,
    colors,
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
    selectedDate: string;
    colors: any;
}) => {
    const insets = useSafeAreaInsets();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateSelect = (day: number) => {
        setSelectedDay(day);
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        onSelect(dateStr);
    };

    const handleApply = () => {
        if (selectedDay) {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
            onSelect(dateStr);
        }
        onClose();
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <View style={[styles.bottomSheetContent, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
                    <View style={styles.modalHandle} />
                    <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>Date Of Birth</Text>
                    
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                const prevMonth = new Date(currentMonth);
                                prevMonth.setMonth(prevMonth.getMonth() - 1);
                                setCurrentMonth(prevMonth);
                            }}
                        >
                            <Ionicons name="chevron-back" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.monthYear, { color: colors.text }]}>{monthName}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                const nextMonth = new Date(currentMonth);
                                nextMonth.setMonth(nextMonth.getMonth() + 1);
                                setCurrentMonth(nextMonth);
                            }}
                        >
                            <Ionicons name="chevron-forward" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarGrid}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <View key={idx} style={styles.calendarDayHeader}>
                                <Text style={[styles.calendarDayHeaderText, { color: colors.textSecondary }]}>{day}</Text>
                            </View>
                        ))}
                        {days.map((day, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.calendarDay,
                                    day === selectedDay && { backgroundColor: colors.buttonPrimary },
                                ]}
                                onPress={() => day && handleDateSelect(day)}
                                disabled={!day}
                            >
                                {day && (
                                    <Text
                                        style={[
                                            styles.calendarDayText,
                                            { color: day === selectedDay ? colors.buttonText : colors.text },
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.bottomSheetButtons}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: colors.buttonPrimary }]}
                            onPress={handleApply}
                        >
                            <Text style={[styles.applyButtonText, { color: colors.buttonText }]}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Budget range slider component
const BudgetBottomSheet = ({
    visible,
    onClose,
    onSave,
    initialValue,
    colors,
}: {
    visible: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    initialValue: string;
    colors: any;
}) => {
    const insets = useSafeAreaInsets();
    const [minBudget, setMinBudget] = useState(0);
    const [maxBudget, setMaxBudget] = useState(200);

    React.useEffect(() => {
        if (initialValue) {
            const parts = initialValue.split('-');
            if (parts.length === 2) {
                setMinBudget(parseInt(parts[0].replace('$', '')) || 0);
                setMaxBudget(parseInt(parts[1].replace('$', '')) || 200);
            }
        }
    }, [initialValue]);

    const handleSave = () => {
        onSave(`$${minBudget}-$${maxBudget}`);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <View style={[styles.bottomSheetContent, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
                    <View style={styles.modalHandle} />
                    <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>Budget</Text>
                    
                    <View style={styles.budgetContainer}>
                        <View style={styles.budgetInputs}>
                            <View style={styles.budgetInput}>
                                <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Min</Text>
                                <TextInput
                                    style={[styles.budgetInputField, { color: colors.text, borderColor: colors.border }]}
                                    value={`$${minBudget}`}
                                    onChangeText={(text) => {
                                        const num = parseInt(text.replace('$', '')) || 0;
                                        setMinBudget(Math.max(0, Math.min(num, maxBudget)));
                                    }}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.budgetInput}>
                                <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Max</Text>
                                <TextInput
                                    style={[styles.budgetInputField, { color: colors.text, borderColor: colors.border }]}
                                    value={`$${maxBudget}`}
                                    onChangeText={(text) => {
                                        const num = parseInt(text.replace('$', '')) || 200;
                                        setMaxBudget(Math.max(minBudget, Math.min(num, 10000)));
                                    }}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomSheetButtons}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: colors.buttonPrimary }]}
                            onPress={handleSave}
                        >
                            <Text style={[styles.applyButtonText, { color: colors.buttonText }]}>Save changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const AdditionalInformation = forwardRef<AdditionalInformationRef, AdditionalInformationProps>(
    ({ initialValues, onSubmit }, ref) => {
        const colors = useThemeColors();
        const insets = useSafeAreaInsets();
        const [activeBottomSheet, setActiveBottomSheet] = useState<string | null>(null);

        const formikRef = React.useRef<FormikProps<any>>(null);

        useImperativeHandle(ref, () => ({
            submitForm: () => {
                formikRef.current?.submitForm();
            },
        }));

        const formatDisplayValue = (key: string, value: string) => {
            if (!value) return 'NO';
            if (key === 'dateOfBirth') {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
            if (key === 'budgetRange') {
                return value;
            }
            return value;
        };

        return (
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={additionalInfoSchema}
                onSubmit={onSubmit}
            >
                {({ values, setFieldValue, handleSubmit }) => (
                    <View style={styles.container}>
                        <View style={styles.topSection}>
                            <Text style={[styles.title, { color: colors.text }]}>Additional Information</Text>
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {/* General Attributes */}
                            <View style={styles.section}>
                                <TouchableOpacity
                                    style={[styles.infoRow, { borderBottomColor: colors.border }]}
                                    onPress={() => setActiveBottomSheet('dateOfBirth')}
                                >
                                    <Text style={[styles.infoLabel, { color: colors.text }]}>Date Of Birth</Text>
                                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                        {formatDisplayValue('dateOfBirth', values.dateOfBirth)} {'>'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.infoRow, { borderBottomColor: colors.border }]}
                                    onPress={() => setActiveBottomSheet('height')}
                                >
                                    <Text style={[styles.infoLabel, { color: colors.text }]}>Height</Text>
                                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                        {formatDisplayValue('height', values.height)} {'>'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.infoRow, { borderBottomColor: colors.border }]}
                                    onPress={() => setActiveBottomSheet('size')}
                                >
                                    <Text style={[styles.infoLabel, { color: colors.text }]}>Size</Text>
                                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                        {formatDisplayValue('size', values.size)} {'>'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.infoRow, { borderBottomColor: colors.border }]}
                                    onPress={() => setActiveBottomSheet('budget')}
                                >
                                    <Text style={[styles.infoLabel, { color: colors.text }]}>Budget</Text>
                                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                        {formatDisplayValue('budgetRange', values.budgetRange)} {'>'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Measurements Section */}
                            <View style={styles.measurementsSection}>
                                <Text style={[styles.measurementsTitle, { color: colors.text }]}>
                                    Let's Get to Know Your Measurements
                                </Text>
                                <Text style={[styles.measurementsSubtitle, { color: colors.textSecondary }]}>
                                    Accurate measurements help the AI create better outfits
                                </Text>

                                <View style={styles.measurementsGrid}>
                                    <View style={styles.measurementInput}>
                                        <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Waist</Text>
                                        <CustomInput
                                            placeholder=""
                                            value={values.waist}
                                            onChangeText={(text) => setFieldValue('waist', text)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.measurementInput}>
                                        <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Hips</Text>
                                        <CustomInput
                                            placeholder=""
                                            value={values.hips}
                                            onChangeText={(text) => setFieldValue('hips', text)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.measurementInput}>
                                        <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Shoulders</Text>
                                        <CustomInput
                                            placeholder=""
                                            value={values.shoulders}
                                            onChangeText={(text) => setFieldValue('shoulders', text)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.measurementInput}>
                                        <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Chest</Text>
                                        <CustomInput
                                            placeholder=""
                                            value={values.chest}
                                            onChangeText={(text) => setFieldValue('chest', text)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.bodyShapeButton, { borderColor: colors.border }]}
                                    onPress={() => setActiveBottomSheet('bodyType')}
                                >
                                    <Text style={[styles.bodyShapeButtonText, { color: values.bodyType ? colors.text : colors.textSecondary }]}>
                                        {values.bodyType || 'Select your body shape'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={scaleFontSize(20)} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        {/* Bottom Sheets */}
                        <DatePickerBottomSheet
                            visible={activeBottomSheet === 'dateOfBirth'}
                            onClose={() => setActiveBottomSheet(null)}
                            onSelect={(date) => setFieldValue('dateOfBirth', date)}
                            selectedDate={values.dateOfBirth}
                            colors={colors}
                        />

                        {/* Height Bottom Sheet */}
                        <Modal
                            visible={activeBottomSheet === 'height'}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setActiveBottomSheet(null)}
                        >
                            <KeyboardAvoidingView
                                style={styles.modalOverlay}
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={0}
                            >
                                <TouchableOpacity
                                    style={styles.modalBackdrop}
                                    activeOpacity={1}
                                    onPress={() => setActiveBottomSheet(null)}
                                />
                                <View
                                    style={[
                                        styles.bottomSheetContent,
                                        { backgroundColor: colors.background, paddingBottom: insets.bottom },
                                    ]}
                                >
                                    <View style={styles.modalHandle} />
                                    <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>Height</Text>
                                    <CustomInput
                                        placeholder="5'7 inch"
                                        value={values.height}
                                        onChangeText={(text) => setFieldValue('height', text)}
                                    />
                                    <View style={styles.bottomSheetButtons}>
                                        <TouchableOpacity
                                            style={[styles.cancelButton, { borderColor: colors.border }]}
                                            onPress={() => setActiveBottomSheet(null)}
                                        >
                                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.applyButton, { backgroundColor: colors.buttonPrimary }]}
                                            onPress={() => setActiveBottomSheet(null)}
                                        >
                                            <Text style={[styles.applyButtonText, { color: colors.buttonText }]}>
                                                Save changes
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </Modal>

                        {/* Size Bottom Sheet */}
                        <Modal
                            visible={activeBottomSheet === 'size'}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setActiveBottomSheet(null)}
                        >
                            <KeyboardAvoidingView
                                style={styles.modalOverlay}
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={0}
                            >
                                <TouchableOpacity
                                    style={styles.modalBackdrop}
                                    activeOpacity={1}
                                    onPress={() => setActiveBottomSheet(null)}
                                />
                                <View
                                    style={[
                                        styles.bottomSheetContent,
                                        { backgroundColor: colors.background, paddingBottom: insets.bottom },
                                    ]}
                                >
                                    <View style={styles.modalHandle} />
                                    <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>Size</Text>
                                    <ScrollView style={styles.sizeList}>
                                        {SIZES.map((size) => (
                                            <TouchableOpacity
                                                key={size}
                                                style={[
                                                    styles.sizeItem,
                                                    {
                                                        backgroundColor: values.size === size ? colors.surface : 'transparent',
                                                        borderBottomColor: colors.border,
                                                    },
                                                ]}
                                                onPress={() => {
                                                    setFieldValue('size', size);
                                                    setActiveBottomSheet(null);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.sizeItemText,
                                                        {
                                                            color: values.size === size ? colors.text : colors.textSecondary,
                                                            fontWeight: values.size === size ? 'bold' : 'normal',
                                                        },
                                                    ]}
                                                >
                                                    {size}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <View style={styles.bottomSheetButtons}>
                                        <TouchableOpacity
                                            style={[styles.cancelButton, { borderColor: colors.border }]}
                                            onPress={() => setActiveBottomSheet(null)}
                                        >
                                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </Modal>

                        <BudgetBottomSheet
                            visible={activeBottomSheet === 'budget'}
                            onClose={() => setActiveBottomSheet(null)}
                            onSave={(value) => {
                                setFieldValue('budgetRange', value);
                            }}
                            initialValue={values.budgetRange}
                            colors={colors}
                        />

                        {/* Body Shape Bottom Sheet */}
                        <Modal
                            visible={activeBottomSheet === 'bodyType'}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setActiveBottomSheet(null)}
                        >
                            <KeyboardAvoidingView
                                style={styles.modalOverlay}
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={0}
                            >
                                <TouchableOpacity
                                    style={styles.modalBackdrop}
                                    activeOpacity={1}
                                    onPress={() => setActiveBottomSheet(null)}
                                />
                                <View
                                    style={[
                                        styles.bottomSheetContent,
                                        { backgroundColor: colors.background, paddingBottom: insets.bottom },
                                    ]}
                                >
                                    <View style={styles.modalHandle} />
                                    <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>Body Shape</Text>
                                    <View style={styles.bodyShapeOptions}>
                                        {BODY_SHAPES.map((shape) => (
                                            <TouchableOpacity
                                                key={shape}
                                                style={[
                                                    styles.bodyShapeOption,
                                                    {
                                                        backgroundColor:
                                                            values.bodyType === shape ? colors.buttonPrimary : colors.surface,
                                                    },
                                                ]}
                                                onPress={() => {
                                                    setFieldValue('bodyType', shape);
                                                    setActiveBottomSheet(null);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.bodyShapeOptionText,
                                                        {
                                                            color:
                                                                values.bodyType === shape
                                                                    ? colors.buttonText
                                                                    : colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {shape}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </Modal>
                    </View>
                )}
            </Formik>
        );
    }
);

AdditionalInformation.displayName = 'AdditionalInformation';

export default AdditionalInformation;

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
    },
    content: {
        flex: 1,
        width: '100%',
    },
    section: {
        width: '100%',
        marginBottom: scaleFontSize(32),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: scaleFontSize(16),
        borderBottomWidth: 1,
    },
    infoLabel: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    infoValue: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    measurementsSection: {
        width: '100%',
        marginTop: scaleFontSize(24),
    },
    measurementsTitle: {
        fontSize: scaleFontSize(20),
        lineHeight: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
    },
    measurementsSubtitle: {
        fontSize: scaleFontSize(14),
        lineHeight: scaleFontSize(20),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(24),
    },
    measurementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: scaleFontSize(16),
    },
    measurementInput: {
        width: '48%',
        marginBottom: scaleFontSize(16),
    },
    measurementLabel: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(8),
    },
    bodyShapeButton: {
        width: '100%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scaleFontSize(8),
    },
    bodyShapeButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomSheetContent: {
        borderTopLeftRadius: scaleFontSize(20),
        borderTopRightRadius: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(16),
        maxHeight: '80%',
    },
    modalHandle: {
        width: scaleFontSize(40),
        height: scaleFontSize(4),
        backgroundColor: '#D3D3D3',
        borderRadius: scaleFontSize(2),
        alignSelf: 'center',
        marginBottom: scaleFontSize(16),
    },
    bottomSheetTitle: {
        fontSize: scaleFontSize(20),
        lineHeight: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(24),
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
    },
    monthYear: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoSemiBold,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: scaleFontSize(24),
    },
    calendarDayHeader: {
        width: '14.28%',
        alignItems: 'center',
        paddingVertical: scaleFontSize(8),
    },
    calendarDayHeaderText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoSemiBold,
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scaleFontSize(4),
    },
    calendarDayText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    budgetContainer: {
        marginBottom: scaleFontSize(24),
    },
    budgetInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetInput: {
        width: '48%',
    },
    budgetLabel: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(8),
    },
    budgetInputField: {
        width: '100%',
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    sizeList: {
        maxHeight: scaleFontSize(300),
        marginBottom: scaleFontSize(24),
    },
    sizeItem: {
        paddingVertical: scaleFontSize(16),
        paddingHorizontal: scaleFontSize(16),
        borderBottomWidth: 1,
    },
    sizeItemText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    bodyShapeOptions: {
        marginBottom: scaleFontSize(24),
    },
    bodyShapeOption: {
        paddingVertical: scaleFontSize(16),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        marginBottom: scaleFontSize(8),
    },
    bodyShapeOptionText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    bottomSheetButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scaleFontSize(16),
        gap: scaleFontSize(12),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: scaleFontSize(14),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
    },
    applyButton: {
        flex: 1,
        paddingVertical: scaleFontSize(14),
        borderRadius: scaleFontSize(8),
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
        color: '#FFFFFF',
    },
});
