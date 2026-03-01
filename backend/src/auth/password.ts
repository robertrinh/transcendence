export const MIN_PASSWORD_LENGTH = 8

export function validatePassword(password: string): { valid: true } | { valid: false; error: string } {
	if (password.length < MIN_PASSWORD_LENGTH) {
		return {
			valid: false,
			error: 'Password must be at least 8 characters long'
		}
	}
	return { valid: true }
}
