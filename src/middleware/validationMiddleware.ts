// Middleware for centralizing Joi validation across routes
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { BadRequestError } from './errorHandlerMiddleware';

/**
 * Creates a middleware function that validates request data against a Joi schema
 * @param schema The Joi schema to validate against
 * @param property The request property to validate (body, params, query)
 * @returns Express middleware function
 */
export const validateRequest = (
  schema: Schema,
  property: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true, // remove unknown elements from objects
    });

    if (!error) {
      next();
    } else {
      const details = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      next(new BadRequestError('Validation failed').withDetails(details));
    }
  };
};

export default validateRequest;
