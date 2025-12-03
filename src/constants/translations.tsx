export const translations = {
    // Auth Screens
    auth: {
        welcome: 'Welcome to Luxify',
        welcomeSubtitle: 'Please log in or sign up to continue shopping',
        continueWithGoogle: 'Continue with Google',
        continueWithFacebook: 'Continue with Facebook',
        continueWithApple: 'Continue with Apple',
        signInWithPassword: 'Sign in with password',
        dontHaveAccount: "Don't have an account? ",
        signUp: 'Sign up',
        createAccount: 'Create Your Account',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        rememberMe: 'Remember me',
        orContinueWith: 'or continue with',
        alreadyHaveAccount: 'Already have an account? ',
        signIn: 'Sign in',
    },

    // Common
    common: {
        or: 'or',
    },

    // Onboarding
    onboarding: {
        successful: 'Successful',
        successMessage: 'You have successfully registered in our app and start working in it.',
        startSetup: 'Start setup',
        // Step 1
        step1Title: "Let's personalize your style experience",
        step1Subtitle: "No spam, no weird stuff. Just your name to make things feel a little more 'you'",
        firstNamePlaceholder: 'First name',
        lastNamePlaceholder: 'Last name',
        // Step 2
        step2Title: 'Where should we send your receipts?',
        step2Subtitle: 'This helps you track your purchases and keep everything in one place.',
        emailPlaceholder: 'name@email.com',
        // Step 3
        step3Title: "Tell us about your day to day",
        step3Subtitle: "Knowing your job helps us suggest outfits that actually fit your daily routine.",
        occupationPlaceholder: 'Type occupation here',
        orSelectOne: 'Or select one:',
        // Step 4
        step4Title: 'Pick your favorite brands',
        step4Subtitle: "Select the brands that match your style — this helps us recommend outfits you'll actually want to wear.",
        findBrands: 'Find brands',
        likeAtLeast3Brands: 'Like at least 3 brands',
        // Photo Upload Info
        photoUploadTitle: "Let's Get to Know Your Style",
        photoUploadInstructions: 'Upload or take 2-3 photos of yourself in good lighting, standing against a plain background.',
        tip: 'Tip:',
        photoUploadTip: 'Use neutral lighting and a plain background for best results.',
        // Photo Upload
        uploadPhotos: 'Upload 3 photos or more',
        orTakePhoto: 'Or take a photo',
        snapYourFit: 'Snap your fit',
        aiDescription: 'Capture your outfit with a quick photo. Luxify AI instantly analyzes your style, identifying key pieces and how they work together.',
        // Common
        next: 'Next',
        back: 'Back',
    },
};

export type TranslationKeys = typeof translations;
