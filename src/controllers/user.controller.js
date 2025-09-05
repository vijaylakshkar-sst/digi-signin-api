const { User, Role } = require('../../models');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');
const bcrypt = require('bcrypt');

exports.create = async (req, res) => {
  const { error, value } = createUserSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
 
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    // Replace plain password with hashed one
    value.password = hashedPassword;

    const user = await User.create(value);
   
    
    res.status(201).json({status:true,data:user});
  } catch (err) {
   if (err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => `${e.path} already exists.`).join(', ');
    return res.status(400).json({ status: false, error: message });
  }

  // Fallback for all other errors
  return res.status(500).json({ status: false, error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({ include: [{ model: Role, as: 'role' }] });
    res.json({status:true,data:users});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({status:true,data:user});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: false, error: error.details[0].message });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, error: 'User not found' });
    }

    // ✅ Check for mobile conflict
    if (value.mobile && value.mobile !== user.mobile) {
      const existingMobile = await User.findOne({ where: { mobile: value.mobile } });
      if (existingMobile) {
        return res.status(400).json({ status: false, error: 'Mobile already exists.' });
      }
    }

    // ✅ Check for email conflict
    if (value.email && value.email !== user.email) {
      const existingEmail = await User.findOne({ where: { email: value.email } });
      if (existingEmail) {
        return res.status(400).json({ status: false, error: 'Email already exists.' });
      }
    }

    // 🔐 Hash new password if present
    if (value.password) {
      const saltRounds = 10;
      value.password = await bcrypt.hash(value.password, saltRounds);
    }

    await user.update(value);
    return res.json({ status: true, data: user });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

exports.softDelete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy(); // sets deletedAt
    res.json({ status:true, message: 'User Deleted Successfully !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.restore = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id }, paranoid: false });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.restore();
    res.json({status:true, message: 'User restored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.permanentDelete = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id }, paranoid: false });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy({ force: true });
    res.json({status:true, message: 'User permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
