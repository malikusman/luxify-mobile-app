import { Image } from 'react-native';

/**
 * Preloads images to improve loading performance
 * Call this before navigating to screens that use these images
 */
export const preloadAwarenessImages = () => {
    const images = [
        require('@/assets/intro.png'),
        require('@/assets/intro1.png'),
        require('@/assets/intro2.png'),
        require('@/assets/intro3.png'),
        require('@/assets/logoLight.png'),
    ];

    images.forEach((imageSource) => {
        try {
            const resolved = Image.resolveAssetSource(imageSource);
            if (resolved?.uri) {
                Image.prefetch(resolved.uri).catch(() => {
                    // Silently fail if prefetch doesn't work
                });
            }
        } catch (error) {
            // Silently fail if image resolution fails
        }
    });
};

/**
 * Preloads a single image
 */
export const preloadImage = (imageSource: any) => {
    try {
        const resolved = Image.resolveAssetSource(imageSource);
        if (resolved?.uri) {
            Image.prefetch(resolved.uri).catch(() => {
                // Silently fail if prefetch doesn't work
            });
        }
    } catch (error) {
        // Silently fail if image resolution fails
    }
};

/**
 * Preloads home screen images to improve loading performance
 * Call this when the home screen mounts or before navigating to it
 */
export const preloadHomeImages = () => {
    const images = [
        require('@/assets/ready.png'),
        require('@/assets/closet.png'),
        require('@/assets/lookbook.png'),
        require('@/assets/home_background.png'),
    ];

    images.forEach((imageSource) => {
        try {
            const resolved = Image.resolveAssetSource(imageSource);
            if (resolved?.uri) {
                Image.prefetch(resolved.uri).catch(() => {
                    // Silently fail if prefetch doesn't work
                });
            }
        } catch (error) {
            // Silently fail if image resolution fails
        }
    });
};

