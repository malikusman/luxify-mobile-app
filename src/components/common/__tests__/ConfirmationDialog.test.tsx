import { Alert } from 'react-native';
import {
    showConfirmationDialog,
    showLogoutDialog,
    showDeleteDialog,
    showPermissionDialog,
} from '../ConfirmationDialog';

jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

describe('ConfirmationDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('showConfirmationDialog', () => {
        it('should show alert with default options', () => {
            const onConfirm = jest.fn();

            showConfirmationDialog({
                title: 'Test Title',
                message: 'Test Message',
                onConfirm,
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Test Title',
                'Test Message',
                expect.arrayContaining([
                    expect.objectContaining({
                        text: 'Cancel',
                        style: 'cancel',
                    }),
                    expect.objectContaining({
                        text: 'Confirm',
                        style: 'default',
                    }),
                ])
            );
        });

        it('should show alert with custom options', () => {
            const onConfirm = jest.fn();
            const onCancel = jest.fn();

            showConfirmationDialog({
                title: 'Custom Title',
                message: 'Custom Message',
                confirmText: 'Yes',
                cancelText: 'No',
                confirmButtonStyle: 'destructive',
                onConfirm,
                onCancel,
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Custom Title',
                'Custom Message',
                expect.arrayContaining([
                    expect.objectContaining({
                        text: 'No',
                        style: 'cancel',
                        onPress: onCancel,
                    }),
                    expect.objectContaining({
                        text: 'Yes',
                        style: 'destructive',
                    }),
                ])
            );
        });

        it('should call onConfirm when confirm button is pressed', () => {
            const onConfirm = jest.fn();

            showConfirmationDialog({
                title: 'Test',
                message: 'Test',
                onConfirm,
            });

            const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
            const buttons = callArgs[2];
            const confirmButton = buttons.find((btn: any) => btn.text === 'Confirm');
            
            confirmButton.onPress();
            expect(onConfirm).toHaveBeenCalled();
        });
    });

    describe('showLogoutDialog', () => {
        it('should show logout confirmation dialog', () => {
            const onConfirm = jest.fn();

            showLogoutDialog(onConfirm);

            expect(Alert.alert).toHaveBeenCalledWith(
                'Sign Out',
                'Are you sure you want to sign out?',
                expect.arrayContaining([
                    expect.objectContaining({
                        text: 'Cancel',
                        style: 'cancel',
                    }),
                    expect.objectContaining({
                        text: 'Sign Out',
                        style: 'destructive',
                    }),
                ])
            );
        });

        it('should call onCancel when cancel button is pressed', () => {
            const onConfirm = jest.fn();
            const onCancel = jest.fn();

            showLogoutDialog(onConfirm, onCancel);

            const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
            const buttons = callArgs[2];
            const cancelButton = buttons.find((btn: any) => btn.text === 'Cancel');
            
            cancelButton.onPress();
            expect(onCancel).toHaveBeenCalled();
        });
    });

    describe('showDeleteDialog', () => {
        it('should show delete confirmation dialog without item name', () => {
            const onConfirm = jest.fn();

            showDeleteDialog(onConfirm);

            expect(Alert.alert).toHaveBeenCalledWith(
                'Delete',
                'Are you sure you want to delete this item? This action cannot be undone.',
                expect.any(Array)
            );
        });

        it('should show delete confirmation dialog with item name', () => {
            const onConfirm = jest.fn();

            showDeleteDialog(onConfirm, 'Test Item');

            expect(Alert.alert).toHaveBeenCalledWith(
                'Delete',
                'Are you sure you want to delete "Test Item"? This action cannot be undone.',
                expect.any(Array)
            );
        });
    });

    describe('showPermissionDialog', () => {
        it('should show permission request dialog', () => {
            const onConfirm = jest.fn();
            const message = 'This app needs camera permission to take photos.';

            showPermissionDialog('Camera', message, onConfirm);

            expect(Alert.alert).toHaveBeenCalledWith(
                'Camera Permission Required',
                message,
                expect.arrayContaining([
                    expect.objectContaining({
                        text: 'Grant Permission',
                        style: 'default',
                    }),
                ])
            );
        });
    });
});

