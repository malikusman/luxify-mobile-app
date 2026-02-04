import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import ChooseStylistStep1 from '@/app/profile/components/ChooseStylistStep1';
import { Stylist } from '@/src/services/modules/stylists/stylistTypes';

interface ChangeStylistModalProps {
    visible: boolean;
    onClose: () => void;
    selectedStylist: Stylist | null;
    currentStylist: Stylist | null;
    onSelectStylist: (stylist: Stylist) => void;
}

export default function ChangeStylistModal({
    visible,
    onClose,
    selectedStylist,
    currentStylist,
    onSelectStylist,
}: ChangeStylistModalProps) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={[styles.content, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.body}>
                        <ChooseStylistStep1
                            selectedStylist={selectedStylist || (currentStylist ? {
                                id: currentStylist.id,
                                name: currentStylist.name,
                                personality_description: currentStylist.personality_description || '',
                                avatar_url: currentStylist.avatar_url,
                                specialization: currentStylist.specialization,
                                is_active: currentStylist.is_active,
                            } : null)}
                            onSelectStylist={onSelectStylist}
                            disableAutoSelect={true}
                            disableMutation={true}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
        paddingVertical: scaleFontSize(16),
    },
    title: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
    },
    closeButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        flex: 1,
    },
});
