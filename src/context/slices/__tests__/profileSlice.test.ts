import profileReducer, {
  setCurrentStep,
  nextStep,
  previousStep,
  updateProfileData,
  setProfileCompleted,
  resetProfile,
  ProfileData,
} from '../profileSlice';

describe('profileSlice', () => {
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
    expect(profileReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCurrentStep', () => {
    it('should set the current step', () => {
      const action = setCurrentStep(3);
      const state = profileReducer(initialState, action);

      expect(state.currentStep).toBe(3);
    });

    it('should allow setting step to any valid number', () => {
      const action = setCurrentStep(2);
      const state = profileReducer(initialState, action);

      expect(state.currentStep).toBe(2);
    });
  });

  describe('nextStep', () => {
    it('should increment current step when not at max', () => {
      const action = nextStep();
      const state = profileReducer(initialState, action);

      expect(state.currentStep).toBe(2);
    });

    it('should not increment beyond total steps', () => {
      const maxStepState = {
        ...initialState,
        currentStep: 4,
      };

      const action = nextStep();
      const state = profileReducer(maxStepState, action);

      expect(state.currentStep).toBe(4);
    });

    it('should increment from step 2 to 3', () => {
      const step2State = {
        ...initialState,
        currentStep: 2,
      };

      const action = nextStep();
      const state = profileReducer(step2State, action);

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
      const state = profileReducer(step2State, action);

      expect(state.currentStep).toBe(1);
    });

    it('should not decrement below step 1', () => {
      const action = previousStep();
      const state = profileReducer(initialState, action);

      expect(state.currentStep).toBe(1);
    });
  });

  describe('updateProfileData', () => {
    it('should update firstName', () => {
      const action = updateProfileData({ firstName: 'John' });
      const state = profileReducer(initialState, action);

      expect(state.data.firstName).toBe('John');
      expect(state.data.lastName).toBe('');
    });

    it('should update lastName', () => {
      const action = updateProfileData({ lastName: 'Doe' });
      const state = profileReducer(initialState, action);

      expect(state.data.lastName).toBe('Doe');
    });

    it('should update email', () => {
      const action = updateProfileData({ email: 'john@example.com' });
      const state = profileReducer(initialState, action);

      expect(state.data.email).toBe('john@example.com');
    });

    it('should update occupation', () => {
      const action = updateProfileData({ occupation: 'Developer' });
      const state = profileReducer(initialState, action);

      expect(state.data.occupation).toBe('Developer');
    });

    it('should update selectedBrands', () => {
      const brands = ['Brand1', 'Brand2', 'Brand3'];
      const action = updateProfileData({ selectedBrands: brands });
      const state = profileReducer(initialState, action);

      expect(state.data.selectedBrands).toEqual(brands);
    });

    it('should update multiple fields at once', () => {
      const action = updateProfileData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      const state = profileReducer(initialState, action);

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

      const action = updateProfileData({ email: 'john@example.com' });
      const state = profileReducer(stateWithData, action);

      expect(state.data.firstName).toBe('John');
      expect(state.data.lastName).toBe('Doe');
      expect(state.data.email).toBe('john@example.com');
    });
  });

  describe('setProfileCompleted', () => {
    it('should set isCompleted to true', () => {
      const action = setProfileCompleted();
      const state = profileReducer(initialState, action);

      expect(state.isCompleted).toBe(true);
    });
  });

  describe('resetProfile', () => {
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

      const action = resetProfile();
      const state = profileReducer(stateWithData, action);

      expect(state.currentStep).toBe(1);
      expect(state.data).toEqual(initialState.data);
      expect(state.isCompleted).toBe(false);
    });
  });
});

