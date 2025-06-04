// Joi schema for order validation
import Joi from 'joi';

export const orderSchema = Joi.object({
  products: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  total: Joi.number().min(0).required(),
  status: Joi.string().valid('pending', 'completed', 'cancelled', 'shipped', 'delivered').optional(),
});

export const orderUpdateSchema = Joi.object({
  products: Joi.array().items(Joi.string().hex().length(24)).min(1),
  total: Joi.number().min(0),
  status: Joi.string().valid('pending', 'completed', 'cancelled', 'shipped', 'delivered'),
}).min(1);
