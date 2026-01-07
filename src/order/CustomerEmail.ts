import { Schema } from 'effect';

export type EmailAddress = typeof EmailAddress.Type;
export const EmailAddress = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/));

export type UnverifiedEmailAddress = typeof UnverifiedEmailAddress.Type;
const UnverifiedEmailAddress = EmailAddress.pipe(
  Schema.brand('UnverifiedEmailAddress'),
);

export type VerifiedEmailAddress = typeof VerifiedEmailAddress.Type;
const VerifiedEmailAddress = EmailAddress.pipe(
  Schema.brand('VerifiedEmailAddress'),
);

export const CustomerEmail = Schema.Union(
  UnverifiedEmailAddress,
  VerifiedEmailAddress,
);

// type SendPasswordResetEmail = (email: UnverifiedEmailAddress) => Effect.Effect<void>;
