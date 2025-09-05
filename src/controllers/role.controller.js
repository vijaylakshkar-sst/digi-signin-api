const { Role } = require('../../models');
const { createRoleSchema } = require('../validations/role.validation');

exports.create = async (req, res) => {
  const { error, value } = createRoleSchema.validate(req.body);
  if (error) return res.status(400).json({status:false, error: error.details[0].message });

  try {
    const role = await Role.create(value);
    res.status(201).json({status:true,data:role});
  } catch (err) {
    res.status(500).json({status:false, error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json({status:true,data:roles});
  } catch (err) {
    res.status(500).json({status:false, error: err.message });
  }
};
