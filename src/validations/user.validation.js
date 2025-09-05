const Joi = require('joi');

const createUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(100).required().messages({
    'any.required': 'Full name is required.',
    'string.empty': 'Full name cannot be empty.'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
    'string.empty': 'Email cannot be empty.'
  }),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'any.required': 'Mobile number is required.',
    'string.empty': 'Mobile number cannot be empty.',
    'string.pattern.base': 'Mobile number must be 10 digits.'
  }),
  address: Joi.string().allow('', null).max(255).optional(),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must include uppercase, lowercase, number, and special character.',
      'string.empty': 'Password cannot be empty.',
      'any.required': 'Password is required.'
    }),
  profile_picture: Joi.string().allow('', null).optional(),
  token: Joi.string().optional(),
  role_id: Joi.number().integer().required().messages({
    'any.required': 'Role ID is required.',
    'number.base': 'Role ID must be a number.'
  })
});

const updateUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(100).messages({
    'string.min': 'Full name must be at least 3 characters.',
    'string.max': 'Full name can have up to 100 characters.'
  }),

  email: Joi.string().email({ tlds: { allow: false } }).messages({
    'string.email': 'Please enter a valid email address.'
  }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      'string.pattern.base': 'Mobile number must be 10 digits.'
    }),

  address: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Address can have max 255 characters.'
  }),

  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$'))
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
    }),

  profile_picture: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Profile picture must be a valid URL.'
  }),

  token: Joi.string().optional(),

  role_id: Joi.number().integer().messages({
    'number.base': 'Role ID must be a number.'
  })
});

module.exports = { createUserSchema, updateUserSchema };
