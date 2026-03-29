import { Alert } from 'react-native';

export interface ConfirmationDialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    confirmButtonStyle?: 'default' | 'destructive' | 'cancel';
    cancelButtonStyle?: 'default' | 'destructive' | 'cancel';
}

/**
 * Shows a confirmation dialog with customizable options
 * @param options - Configuration options for the dialog
 */
export const showConfirmationDialog = (options: ConfirmationDialogOptions): void => {
    const {
        title,
        message,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm,
        onCancel,
        confirmButtonStyle = 'default',
        cancelButtonStyle = 'cancel',
    } = options;

    const buttons: any[] = [
        {
            text: cancelText,
            style: cancelButtonStyle,
            onPress: onCancel,
        },
        {
            text: confirmText,
            style: confirmButtonStyle,
            onPress: async () => {
                await onConfirm();
            },
        },
    ];

    Alert.alert(title, message, buttons);
};

/**
 * Shows a logout confirmation dialog
 * @param onConfirm - Callback when user confirms logout
 * @param onCancel - Optional callback when user cancels
 */
export const showLogoutDialog = (
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void
): void => {
    showConfirmationDialog({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        confirmButtonStyle: 'destructive',
        cancelButtonStyle: 'cancel',
        onConfirm,
        onCancel,
    });
};

/**
 * Shows a delete confirmation dialog
 * @param itemName - Optional name of the item being deleted
 * @param onConfirm - Callback when user confirms deletion
 * @param onCancel - Optional callback when user cancels
 */
export const showDeleteDialog = (
    onConfirm: () => void | Promise<void>,
    itemName?: string,
    onCancel?: () => void
): void => {
    const message = itemName
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : 'Are you sure you want to delete this item? This action cannot be undone.';

    showConfirmationDialog({
        title: 'Delete',
        message,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonStyle: 'destructive',
        cancelButtonStyle: 'cancel',
        onConfirm,
        onCancel,
    });
};

/**
 * Shows a permission request dialog
 * @param permissionName - Name of the permission being requested
 * @param message - Custom message explaining why the permission is needed
 * @param onConfirm - Callback when user grants permission
 * @param onCancel - Optional callback when user denies permission
 */
export const showPermissionDialog = (
    permissionName: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void
): void => {
    showConfirmationDialog({
        title: `${permissionName} Permission Required`,
        message,
        confirmText: 'Grant Permission',
        cancelText: 'Cancel',
        confirmButtonStyle: 'default',
        cancelButtonStyle: 'cancel',
        onConfirm,
        onCancel,
    });
};

