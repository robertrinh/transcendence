
//* email format validation: requires local part, @, and domain with at least one dot.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): { valid: true } | { valid: false; error: string } {
	if (!EMAIL_REGEX.test(email)) {
		return {
			valid: false,
			error: 'Please enter a valid email address'
		};
	}
	return { valid: true };
}
