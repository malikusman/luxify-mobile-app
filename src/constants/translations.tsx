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
        ok: 'OK',
        cancel: 'Cancel',
        remove: 'Remove',
        error: 'Error',
    },

    // Image Picker
    imagePicker: {
        permissionsRequired: 'Permissions Required',
        permissionsMessage: 'Camera and photo library permissions are required to upload photos.',
        permissionsNotGranted: 'Permissions not granted',
        userCanceled: 'User canceled',
        noImageSelected: 'No image selected',
        noImageCaptured: 'No image captured',
        pickImageError: 'Failed to pick image. Please try again.',
        takePhotoError: 'Failed to take photo. Please try again.',
        addPhoto: 'Add Photo',
        replacePhoto: 'Replace Photo',
        takePhoto: 'Take Photo',
        chooseFromGallery: 'Choose from Gallery',
        chooseOption: 'Choose an option',
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
        maximumPhotos: 'Maximum Photos',
        maximumPhotosMessage: 'You can only upload up to 3 photos.',
        // Common
        next: 'Next',
        back: 'Back',
        // Choose Stylist
        chooseStylistTitle: 'Choose Your Personal Stylist',
        chooseStylistSubtitle: "Meet your virtual fashion expert the one who'll guide your entire experience. Each stylist has a unique vibe and approach to fashion.",
        stylistLearningInfo: "Your stylist has their own vibe but they'll learn from your preferences over time to give you smarter, more personalized outfit recommendations. The more you use Luxify, the better they get at styling you.",
        connectSocialTitle: 'Connect your Social Media',
        connectSocialSubtitle: 'By connecting your social media platforms, we can get to know you better and create outfits that match your style.',
        connectInstagram: 'Connect Instagram',
        connectFacebook: 'Connect Facebook',
        connectTiktok: 'Connect Tiktok',
        // Premium Subscription
        premiumTitle: 'Unlock Your Premium Style Experience',
        premiumSubtitle: 'Get personalized outfit recommendations powered by AI - tailored to your shape, taste, and lifestyle.',
        premiumPlan: 'Luxify Premium',
        annualPlan: 'Annual Plan',
        featureUnlimitedAI: 'Unlimited AI Style Analysis',
        featurePersonalized: 'Personalized Shopping Recommendations',
        featureAdvanced: 'Advanced Style Insights',
        startFreeTrial: 'Start your 3-day free trial $99.99 per year after 23/06/2025',
        startFreeTrialButton: 'Start Free Trial',
        restorePurchases: 'Restore Purchases',
        premiumDisclaimer: 'After the trial period, you will be charged **$99.99 annually** unless you cancel at least 24 hours before the trial ends. Your subscription will automatically renew unless canceled. You can cancel anytime in your device\'s settings. View our Terms and Privacy Policy.',
        termsAndPrivacy: 'Terms and Privacy Policy',
    },

    // Home
    home: {
        welcomeMessage: 'Welcome, Lucia',
        instructionText: 'Add your pieces to get personalized daily outfits from your closet.',
        closet: 'Closet',
        addToCloset: '+ Add to closet',
        dontKnowWhereToStart: "Don't know where to start?",
        getStyledByLuxify: 'Get styled by Luxify',
    },
};

export type TranslationKeys = typeof translations;
