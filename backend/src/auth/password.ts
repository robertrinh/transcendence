export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 50

export function validatePassword(password: string): { valid: true } | { valid: false; error: string } {
	if (password.length < MIN_PASSWORD_LENGTH) {
		return {
			valid: false,
			error: 'Password must be at least 8 characters long'
		}
	}
	if (password.length > MAX_PASSWORD_LENGTH) {
		return {
			valid: false,
			error: 'Password cannot be longer than 50 characters'
		}
	}
	return { valid: true }
}
