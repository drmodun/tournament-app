import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import { user } from 'src/db/schema';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(@Inject('Stripe') private readonly stripe: Stripe) {}

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({ email, name });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create Stripe customer',
      );
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async getCustomerId(userId: number): Promise<string | null> {
    const customer = await db
      .select({
        stripeCustomerId: user.customerId,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!customer.length) {
      return null;
    }

    return customer[0].stripeCustomerId;
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async getUserIdFromCustomerId(customerId: string): Promise<number | null> {
    const userWithCustomerId = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.customerId, customerId));

    if (!userWithCustomerId.length) {
      return null;
    }

    return userWithCustomerId[0].id;
  }
}

//TODO: integrate with
