import { Schema } from 'effect';

export type EmailAddress = typeof EmailAddress.Type;
export const EmailAddress = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/));
