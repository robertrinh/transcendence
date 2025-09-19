import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
	extends: [
		eslint.configs.recommended,
		tseslint.configs.strict,
	],
		languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			projectService: true,
		},
	},
	rules: {
		"no-implicit-globals": ["error", {
			"lexicalBindings": true
		}]
	},
 });
