// Joi schema for user login validation
import Joi from 'joi';

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});
