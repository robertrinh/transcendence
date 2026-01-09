import { FastifyInstance } from "fastify";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db } from '../database.js'
import { authenticate } from "../auth/middleware.js";

export default async function twofaRoutes(
	fastify: FastifyInstance
) {
	//* Generate QR code
	fastify.post('/auth/2fa/setup', {preHandler: [authenticate]}, async (request, reply) => {
		const { username } = request.user as { username: string };
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(username, 'Transcendence', secret);
		const qrCode = await QRCode.toDataURL(otpauthUrl);

		//* Store secret in database
		db.prepare('UPDATE users SET two_factor_secret = ? WHERE username = ?').run(secret, username);
		return reply.code(200).send({ success: true, qrCode, message: 'QR code generated, scan it with your authenticator app' })
	})

	//* Enable 2FA
	fastify.post('/auth/2fa/enable', {preHandler: [authenticate]}, async (request, reply) => {
		const { userId } = request.user! as { userId: number };

		//* Fetch user's 2FA status and secret from database
		const user = db.prepare('SELECT two_factor_enabled, two_factor_secret FROM users WHERE id = ?')
			.get(userId) as { two_factor_enabled: number, two_factor_secret: string } | undefined

		//* Check if 2FA is already enabled
		if (user?.two_factor_enabled === 1) {
			return reply.code(400).send({ 
				success: false, 
				error: '2FA already enabled' 
			})
		}

		//* Check if 2FA is not set up
		if (!user || !user.two_factor_secret) {
			return reply.code(400).send({ 
				success: false, 
				error: '2FA not set up, set it up!' 
			})
		}
		
		//* verify 2FA code
		const { code } = request.body as { code: string };
		const isValid = authenticator.verify({
			secret: user.two_factor_secret,
			token: code,
		});
		if (!isValid) {
			return reply.code(400).send({ success: false, error: 'Invalid 2FA code' });
		}
		
		//* update database to enable 2FA
		db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(userId);
		return reply.code(200).send({ success: true, message: '2FA enabled successfully' });
	})

	//* disable 2FA
	fastify.post('/auth/2fa/disable', {preHandler: [authenticate]}, async (request, reply) => {
		const { userId } = request.user! as { userId: number };
		const { code } = request.body as { code: string };

		//* fetch user's secret from database + verify 2fa code
		const user = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(userId) as { two_factor_secret: string } | undefined
		if (!user || !user.two_factor_secret) {
			return reply.code(400).send({ 
				success: false, 
				error: '2FA not set up, set it up!' 
			})
		}

		const isValid = authenticator.verify({
			secret: user.two_factor_secret,
			token: code,
		});
		if (!isValid) {
			return reply.code(400).send({ success: false, error: 'Invalid 2FA code' });
		}

		//* update database to disable 2FA
		db.prepare('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?').run(userId);

		return reply.code(200).send({ success: true, message: '2FA disabled successfully' });
	})
}