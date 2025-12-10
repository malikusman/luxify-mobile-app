// Simplified test for auth hooks - testing that hooks are exported and can be imported
describe('authHooks', () => {
    it('should export useSignIn hook', () => {
        const { useSignIn } = require('../authHooks');
        expect(useSignIn).toBeDefined();
        expect(typeof useSignIn).toBe('function');
    });

    it('should export useSignUp hook', () => {
        const { useSignUp } = require('../authHooks');
        expect(useSignUp).toBeDefined();
        expect(typeof useSignUp).toBe('function');
    });

    it('should export useSignOut hook', () => {
        const { useSignOut } = require('../authHooks');
        expect(useSignOut).toBeDefined();
        expect(typeof useSignOut).toBe('function');
    });
});

