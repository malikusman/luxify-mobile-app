import themeReducer, { toggleTheme, setTheme } from '../themeSlice';

describe('themeSlice', () => {
  const initialState = {
    isDarkMode: false,
  };

  it('should return the initial state', () => {
    expect(themeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark mode', () => {
      const action = toggleTheme();
      const state = themeReducer(initialState, action);

      expect(state.isDarkMode).toBe(true);
    });

    it('should toggle from dark to light mode', () => {
      const darkState = {
        isDarkMode: true,
      };

      const action = toggleTheme();
      const state = themeReducer(darkState, action);

      expect(state.isDarkMode).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      let state = initialState;

      state = themeReducer(state, toggleTheme());
      expect(state.isDarkMode).toBe(true);

      state = themeReducer(state, toggleTheme());
      expect(state.isDarkMode).toBe(false);

      state = themeReducer(state, toggleTheme());
      expect(state.isDarkMode).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark mode', () => {
      const action = setTheme(true);
      const state = themeReducer(initialState, action);

      expect(state.isDarkMode).toBe(true);
    });

    it('should set theme to light mode', () => {
      const darkState = {
        isDarkMode: true,
      };

      const action = setTheme(false);
      const state = themeReducer(darkState, action);

      expect(state.isDarkMode).toBe(false);
    });

    it('should set theme to dark when already dark', () => {
      const darkState = {
        isDarkMode: true,
      };

      const action = setTheme(true);
      const state = themeReducer(darkState, action);

      expect(state.isDarkMode).toBe(true);
    });
  });
});

