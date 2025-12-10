import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from '../authSchemas';

describe('authSchemas', () => {
  describe('signUpSchema', () => {
    it('should validate correct sign up data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing email', async () => {
      const invalidData = {
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject password shorter than 6 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345',
        password_confirmation: '12345',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password_confirmation: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing first_name', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject first_name shorter than 2 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'J',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing last_name', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'John',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject last_name shorter than 2 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'John',
        last_name: 'D',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing password_confirmation', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject non-matching passwords', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'different123',
        first_name: 'John',
        last_name: 'Doe',
        rememberMe: false,
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow('Passwords must match');
    });

    it('should allow optional rememberMe', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      await expect(signUpSchema.validate(validData)).resolves.toBeDefined();
    });
  });

  describe('signInSchema', () => {
    it('should validate correct sign in data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: true,
      };

      await expect(signInSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password',
      };

      await expect(signInSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing password', async () => {
      const invalidData = {
        email: 'test@example.com',
      };

      await expect(signInSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', async () => {
      const validData = {
        email: 'test@example.com',
      };

      await expect(forgotPasswordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
      };

      await expect(forgotPasswordSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing email', async () => {
      await expect(forgotPasswordSchema.validate({})).rejects.toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct password reset data', async () => {
      const validData = {
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      await expect(resetPasswordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject password shorter than 6 characters', async () => {
      const invalidData = {
        password: '12345',
        confirmPassword: '12345',
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject non-matching passwords', async () => {
      const invalidData = {
        password: 'password123',
        confirmPassword: 'different123',
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing confirmPassword', async () => {
      const invalidData = {
        password: 'password123',
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('step1Schema', () => {
    it('should validate correct step 1 data', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(step1Schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing firstName', async () => {
      const invalidData = {
        lastName: 'Doe',
      };

      await expect(step1Schema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject firstName shorter than 2 characters', async () => {
      const invalidData = {
        firstName: 'J',
        lastName: 'Doe',
      };

      await expect(step1Schema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing lastName', async () => {
      const invalidData = {
        firstName: 'John',
      };

      await expect(step1Schema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('step2Schema', () => {
    it('should validate correct email', async () => {
      const validData = {
        email: 'test@example.com',
      };

      await expect(step2Schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
      };

      await expect(step2Schema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing email', async () => {
      await expect(step2Schema.validate({})).rejects.toThrow();
    });
  });

  describe('step3Schema', () => {
    it('should validate correct occupation', async () => {
      const validData = {
        occupation: 'Developer',
      };

      await expect(step3Schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing occupation', async () => {
      await expect(step3Schema.validate({})).rejects.toThrow();
    });

    it('should reject occupation shorter than 2 characters', async () => {
      const invalidData = {
        occupation: 'D',
      };

      await expect(step3Schema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('step4Schema', () => {
    it('should validate correct brands selection', async () => {
      const validData = {
        selectedBrands: ['Brand1', 'Brand2', 'Brand3'],
      };

      await expect(step4Schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject less than 3 brands', async () => {
      const invalidData = {
        selectedBrands: ['Brand1', 'Brand2'],
      };

      await expect(step4Schema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject empty brands array', async () => {
      const invalidData = {
        selectedBrands: [],
      };

      await expect(step4Schema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing selectedBrands', async () => {
      await expect(step4Schema.validate({})).rejects.toThrow();
    });

    it('should accept more than 3 brands', async () => {
      const validData = {
        selectedBrands: ['Brand1', 'Brand2', 'Brand3', 'Brand4', 'Brand5'],
      };

      await expect(step4Schema.validate(validData)).resolves.toEqual(validData);
    });
  });
});

