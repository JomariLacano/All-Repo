import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

/** Validates req.body against a Zod schema, replacing it with the parsed/coerced value. */
export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({ error: 'Validation failed.', details: errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
