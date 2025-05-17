// Joi schema for user login validation
import Joi from 'joi';

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  role: Joi.string().valid('admin', 'user').default('user')
});

export const userUpdateSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(4),
  role: Joi.string().valid('admin', 'user')
}).min(1);
