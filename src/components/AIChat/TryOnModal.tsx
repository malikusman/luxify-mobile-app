import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

const { width, height } = Dimensions.get('window');

interface TryOnModalProps {
    visible: boolean;
    onClose: () => void;
    resultUrl: string | null;
}

export default function TryOnModal({ visible, onClose, resultUrl }: TryOnModalProps) {
    const colors = useThemeColors();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Virtual Try-On Result
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    {resultUrl && (
                        <View style={styles.resultContainer}>
                            <Image
                                source={{ uri: resultUrl }}
                                style={styles.resultImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scaleFontSize(20),
    },
    content: {
        width: '100%',
        maxWidth: width * 0.9,
        borderRadius: scaleFontSize(16),
        overflow: 'hidden',
        maxHeight: height * 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingVertical: scaleFontSize(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E3E5E5',
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
    resultContainer: {
        padding: scaleFontSize(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultImage: {
        width: '100%',
        height: width * 0.9,
        borderRadius: scaleFontSize(12),
    },
});
