const Joi = require('joi');

const registerSchema = Joi.object({
  fullname: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Full name must be text.',
      'string.empty': 'Full name is required.',
      'string.min': 'Full name must be at least 3 characters.',
      'any.required': 'Full name is required.'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is a required field.'
    }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be 10 digits.',
      'string.empty': 'Mobile number is required.',
      'any.required': 'Mobile number is required.'
    }),

  address: Joi.string()
    .max(255)
    .allow('', null)
    .messages({
      'string.base': 'Address must be text.',
      'string.max': 'Address can have max 255 characters.'
    }),

  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),

  role: Joi.string()
    .valid('Admin', 'Customer', 'Tipster')
    .optional()
    .messages({
      'any.only': 'Role must be one of Admin, Customer, or Tipster.'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a text value.',
      'string.empty': 'Email is required.',
      'string.email': 'Please enter a valid email address.',
      'any.required': 'Email is a required field.'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Password must be a text value.',
      'string.empty': 'Password is required.',
      'string.min': 'Password must be at least 6 characters long.',
      'any.required': 'Password is a required field.'
    })
});

const passwordSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#\$%\^&\*])[A-Za-z\\d!@#\$%\^&\*]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must have 8 characters, including uppercase, lowercase, number, and special character.'
    })
});

module.exports = { loginSchema,registerSchema,passwordSchema };
