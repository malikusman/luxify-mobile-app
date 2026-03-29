import * as Yup from 'yup';

export const signUpSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    first_name: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    last_name: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
    rememberMe: Yup.boolean(),
});

export const signInSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required'),
    rememberMe: Yup.boolean(),
});

export const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
});

export const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
});

export const step1Schema = Yup.object().shape({
    firstName: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
});

export const step2Schema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
});

export const step3Schema = Yup.object().shape({
    occupation: Yup.string()
        .required('Occupation is required')
        .min(2, 'Occupation must be at least 2 characters'),
});

export const step4Schema = Yup.object().shape({
    selectedBrands: Yup.array()
        .of(Yup.string())
        .default([]),
});
