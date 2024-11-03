import { th } from '@faker-js/faker';
import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

export const StripeProvider = {
  provide: 'Stripe',
  useFactory: async () => {
    if (!process.env.STRIPE_SECRET_KEY)
      throw new InternalServerErrorException('Stripe secret key is not set');
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    });
  },
};
