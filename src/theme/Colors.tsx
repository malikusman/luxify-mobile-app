import { useSelector } from 'react-redux';

export const Colors = {
    light: {
        // Primary Colors
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#666666',

        // Background Colors
        background: '#FFFFFF',
        surface: '#F5F5F5',
        aiChatBackground: '#F0F0F0',
        card: '#FFFFFF',
        cardSecondary: '#D9D9D940',
        tabBarBackground: '#00000014',

        // Text Colors
        text: '#090A0A',
        textSecondary: '#8B8B8B',
        textTertiary: '#999999',
        textDisabled: '#CCCCCC',

        // Border Colors
        border: '#E3E5E5',
        borderLight: '#EEEEEE',

        // Social Media Colors
        google: '#FFFFFF',
        googleBorder: '#DDDDDD',
        facebook: '#1877F2',
        apple: '#000000',

        // Status Colors
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',

        // Button Colors
        buttonPrimary: '#000000',
        buttonSecondary: '#FFFFFF',
        buttonText: '#FFFFFF',
        buttonTextSecondary: '#000000',
        divider: '#E3E5E5',

        // Microphone Button Colors
        micMiddle: '#1F1F1F',
        micInner: '#848484',

        // Bottom Bar Button Colors
        bottomBarButtonBackground: '#F0F0F0',
    },
    dark: {
        // Primary Colors
        primary: '#FFFFFF',
        secondary: '#000000',
        accent: '#999999',

        // Background Colors
        background: '#121212',
        surface: '#1E1E1E',
        aiChatBackground: '#F0F0F0',
        card: '#2C2C2C',
        cardSecondary: '#D9D9D940',
        tabBarBackground: '#FFFFFF14',
        // Text Colors
        text: '#FFFFFF',
        textSecondary: '#AAAAAA',
        textTertiary: '#888888',
        textDisabled: '#555555',

        // Border Colors
        border: '#333333',
        borderLight: '#444444',

        // Social Media Colors
        google: '#2C2C2C',
        googleBorder: '#444444',
        facebook: '#1877F2',
        apple: '#FFFFFF',

        // Status Colors
        success: '#66BB6A',
        error: '#EF5350',
        warning: '#FFA726',
        info: '#42A5F5',

        // Button Colors
        buttonPrimary: '#FFFFFF',
        buttonSecondary: '#2C2C2C',
        buttonText: '#000000',
        buttonTextSecondary: '#FFFFFF',

        // Divider Colors
        divider: '#E3E5E5',

        // Microphone Button Colors
        micMiddle: '#1F1F1F',
        micInner: '#848484',

        // Bottom Bar Button Colors
        bottomBarButtonBackground: '#F0F0F0',
    },
};

interface RootState {
    theme: {
        isDarkMode: boolean;
    };
}

export const useThemeColors = () => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    return isDarkMode ? Colors.dark : Colors.light;
};
