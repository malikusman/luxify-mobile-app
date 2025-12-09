import onboardingReducer, {
  setCurrentStep,
  nextStep,
  previousStep,
  updateOnboardingData,
  setOnboardingCompleted,
  resetOnboarding,
  OnboardingData,
} from '../onboardingSlice';

describe('onboardingSlice', () => {
  const initialState = {
    currentStep: 1,
    totalSteps: 4,
    data: {
      firstName: '',
      lastName: '',
      email: '',
      occupation: '',
      selectedBrands: [],
    },
    isCompleted: false,
  };

  it('should return the initial state', () => {
    expect(onboardingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCurrentStep', () => {
    it('should set the current step', () => {
      const action = setCurrentStep(3);
      const state = onboardingReducer(initialState, action);

      expect(state.currentStep).toBe(3);
    });

    it('should allow setting step to any valid number', () => {
      const action = setCurrentStep(2);
      const state = onboardingReducer(initialState, action);

      expect(state.currentStep).toBe(2);
    });
  });

  describe('nextStep', () => {
    it('should increment current step when not at max', () => {
      const action = nextStep();
      const state = onboardingReducer(initialState, action);

      expect(state.currentStep).toBe(2);
    });

    it('should not increment beyond total steps', () => {
      const maxStepState = {
        ...initialState,
        currentStep: 4,
      };

      const action = nextStep();
      const state = onboardingReducer(maxStepState, action);

      expect(state.currentStep).toBe(4);
    });

    it('should increment from step 2 to 3', () => {
      const step2State = {
        ...initialState,
        currentStep: 2,
      };

      const action = nextStep();
      const state = onboardingReducer(step2State, action);

      expect(state.currentStep).toBe(3);
    });
  });

  describe('previousStep', () => {
    it('should decrement current step when not at min', () => {
      const step2State = {
        ...initialState,
        currentStep: 2,
      };

      const action = previousStep();
      const state = onboardingReducer(step2State, action);

      expect(state.currentStep).toBe(1);
    });

    it('should not decrement below step 1', () => {
      const action = previousStep();
      const state = onboardingReducer(initialState, action);

      expect(state.currentStep).toBe(1);
    });
  });

  describe('updateOnboardingData', () => {
    it('should update firstName', () => {
      const action = updateOnboardingData({ firstName: 'John' });
      const state = onboardingReducer(initialState, action);

      expect(state.data.firstName).toBe('John');
      expect(state.data.lastName).toBe('');
    });

    it('should update lastName', () => {
      const action = updateOnboardingData({ lastName: 'Doe' });
      const state = onboardingReducer(initialState, action);

      expect(state.data.lastName).toBe('Doe');
    });

    it('should update email', () => {
      const action = updateOnboardingData({ email: 'john@example.com' });
      const state = onboardingReducer(initialState, action);

      expect(state.data.email).toBe('john@example.com');
    });

    it('should update occupation', () => {
      const action = updateOnboardingData({ occupation: 'Developer' });
      const state = onboardingReducer(initialState, action);

      expect(state.data.occupation).toBe('Developer');
    });

    it('should update selectedBrands', () => {
      const brands = ['Brand1', 'Brand2', 'Brand3'];
      const action = updateOnboardingData({ selectedBrands: brands });
      const state = onboardingReducer(initialState, action);

      expect(state.data.selectedBrands).toEqual(brands);
    });

    it('should update multiple fields at once', () => {
      const action = updateOnboardingData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      const state = onboardingReducer(initialState, action);

      expect(state.data.firstName).toBe('John');
      expect(state.data.lastName).toBe('Doe');
      expect(state.data.email).toBe('john@example.com');
    });

    it('should preserve existing data when updating partial', () => {
      const stateWithData = {
        ...initialState,
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: '',
          occupation: '',
          selectedBrands: [],
        },
      };

      const action = updateOnboardingData({ email: 'john@example.com' });
      const state = onboardingReducer(stateWithData, action);

      expect(state.data.firstName).toBe('John');
      expect(state.data.lastName).toBe('Doe');
      expect(state.data.email).toBe('john@example.com');
    });
  });

  describe('setOnboardingCompleted', () => {
    it('should set isCompleted to true', () => {
      const action = setOnboardingCompleted();
      const state = onboardingReducer(initialState, action);

      expect(state.isCompleted).toBe(true);
    });
  });

  describe('resetOnboarding', () => {
    it('should reset to initial state', () => {
      const stateWithData = {
        currentStep: 3,
        totalSteps: 4,
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          occupation: 'Developer',
          selectedBrands: ['Brand1', 'Brand2'],
        },
        isCompleted: true,
      };

      const action = resetOnboarding();
      const state = onboardingReducer(stateWithData, action);

      expect(state.currentStep).toBe(1);
      expect(state.data).toEqual(initialState.data);
      expect(state.isCompleted).toBe(false);
    });
  });
});

