// Joi schema for product validation
import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().max(500).allow('', null),
  inStock: Joi.boolean().optional(),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  price: Joi.number().min(0),
  description: Joi.string().max(500).allow('', null),
  inStock: Joi.boolean(),
}).min(1);
