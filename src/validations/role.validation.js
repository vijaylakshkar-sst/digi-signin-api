const Joi = require('joi');

const createRoleSchema = Joi.object({
  name: Joi.string().required()
});

module.exports = { createRoleSchema };
    