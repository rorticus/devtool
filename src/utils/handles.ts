import { Handle } from '@dojo/core/interfaces';
import { Subscription } from '@dojo/shim/Observable';

export function handleFromSubscription(subscription: Subscription): Handle {
	return {
		destroy() {
			subscription.unsubscribe;
		}
	};
}
