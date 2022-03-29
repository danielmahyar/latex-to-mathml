import * as functions from "firebase-functions";
import { createStripeCheckoutSession } from './stripe/checkout';
import { createPaymentIntent } from './stripe/payments';
// import { handleStripeWebhook } from '../stripe/webhooks';
import { createSetupIntent, listPaymentMethods } from './stripe/customer';
import { cancelSubscription, createSubscription, listSubscriptions } from './stripe/billing';
import { handleStripeWebhook } from "./stripe/webhooks";




// Stripe API

export const stripewebhooks = functions.https.onRequest(
	(req, res) => {
		handleStripeWebhook(req, res)
	}
)

export const checkouts = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	const checkoutSession = await createStripeCheckoutSession(data.line_items)
	return checkoutSession
})

export const makePaymentIntent = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	const setupIntent = await createPaymentIntent(data.amount)
	return setupIntent
})

export const saveCard = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	const setupIntent = await createSetupIntent(context.auth.uid)
	return setupIntent
})

export const getCards = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	const wallet = await listPaymentMethods(context.auth.uid)
	return wallet.data
})

export const newSubscription = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	const subscription = await createSubscription(context.auth.uid, data.plan, data.payment_method);
	return subscription
})

export const getSubscriptions = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	const subscriptions = await listSubscriptions(context.auth.uid);
	return subscriptions
})

export const unsubscribe = functions.https.onCall(async (data, context) => {
	if (!context.auth) throw new Error('You must be authorized')
	return await cancelSubscription(context.auth.uid, data.id)
})
