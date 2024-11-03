import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handleWebhook(@Req() request: Request, @Res() response: Response) {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(HttpStatus.BAD_REQUEST);
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionEvent(subscription);
        break;
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    response.sendStatus(HttpStatus.OK);
  }

  private async handleSubscriptionEvent(subscription: Stripe.Subscription) {
    const user = await this.stripeService.getUserIdFromCustomerId(
      subscription.customer as string,
    );

    //TODO: this will be handled in a special subscriptions service
  }
}
