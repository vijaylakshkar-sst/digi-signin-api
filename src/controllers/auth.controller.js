const { User, Role, UserVerification } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loginSchema,registerSchema,passwordSchema  } = require('../validations/auth.validation');

const sendEmail = require('../utils/sendEmail');

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(200).json({ message: error.details[0].message });

  try {
    const { email, password } = value;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
      paranoid: false
    });

    if (!user) return res.status(401).json({status:false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({status:false, message: 'Invalid credentials' });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role?.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    // Optional: save token to DB
    user.token = token;
    await user.save();

    res.json({
      status:true,
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role?.name
      }
    });
  } catch (err) {
    res.status(500).json({status:false, message: err.message });
  }
};


   exports.register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(200).json({
      status: false,
      message: error.details[0].message
    });
  }

  const { fullname, email, mobile, address, password } = value;

  const role = 'Customer';

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(200).json({ status: false, message: 'Email is already registered.' });
    }

    const existingMobile = await User.findOne({ where: { mobile } });
    if (existingMobile) {
      return res.status(200).json({ status: false, message: 'Mobile number is already registered.' });
    }

    const userRole = await Role.findOne({ where: { name: role || 'Customer' } });
    if (!userRole) {
      return res.status(200).json({ status: false, message: 'Invalid role specified.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      mobile,
      address,
      password: hashedPassword,
      role_id: userRole.id
    });

    // ✅ Generate JWT token
    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: userRole.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    // ✅ Save token to DB if needed
    newUser.token = token;
    await newUser.save();

    // ✅ Return login response
    res.status(201).json({
      status: true,
      message: 'User registered and logged in successfully',
      token,
      data: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        mobile: newUser.mobile,
        role: userRole.name
      }
    });

  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  const { email, mobile, type } = req.body; // type: 'register' or 'forgot'

  if (!email) return res.status(200).json({ status: false, message: 'Email is required.' });

  try {
    if (type === 'register') {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) return res.status(200).json({ status: false, message: 'Email already exists.' });

      const mobileExists = await User.findOne({ where: { mobile } });
      if (mobileExists) return res.status(200).json({ status: false, message: 'Mobile number already exists.' });
    } else if (type === 'forgot') {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ status: false, message: 'User not found.' });
    } else {
      return res.status(200).json({ status: false, message: 'Invalid type provided.' });
    }

    const otp = generateOtp(4);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await UserVerification.create({
      email,
      otp,
      data: { type, ...(mobile ? { mobile } : {}) },
      expiresAt
    });

    await sendEmail(email, 'Your OTP Verification Code', `Your OTP is: ${otp}`);

    return res.status(200).json({ status: true, message: 'OTP sent to email successfully.' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(200).json({ status: false, message: 'Email and OTP are required.' });
  }

  try {
    const record = await UserVerification.findOne({ where: { email, otp } });

    if (!record) return res.status(200).json({ status: false, message: 'Invalid OTP or email.' });

    if (new Date() > new Date(record.expiresAt)) {
      return res.status(200).json({ status: false, message: 'OTP expired. Please request a new one.' });
    }
    // Optionally: delete verification record
    await record.destroy();

    res.status(201).json({
      status: true,
      message: 'User verified and registered successfully.'      
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(200).json({ status: false, message: 'Email and OTP are required.' });
  }

  try {
    const record = await UserVerification.findOne({ where: { email, otp } });

    let recordData = record.data;
    if (typeof recordData === 'string') {
    try {
        recordData = JSON.parse(recordData);
    } catch (err) {
        return res.status(200).json({ status: false, message: 'Invalid data format in verification record.' });
    }
    }

    if (recordData?.type !== 'forgot') {
    return res.status(200).json({ status: false, message: 'OTP does not match the forgot password flow.' });
    }

    if (new Date() > new Date(record.expiresAt)) {
      return res.status(200).json({ status: false, message: 'OTP expired. Please request a new one.' });
    }

    // ✅ Generate temporary reset token (valid for 15 min)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    await record.destroy();

    return res.status(200).json({
      status: true,
      message: 'OTP verified. Use the token to reset your password.',
      resetToken
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  let resetToken = req.headers.resettoken;

  if (!resetToken) {
    return res.status(401).json({ status: false, message: 'Reset token is required.' });
  }

  // Remove 'Bearer ' if present
  if (resetToken.startsWith('Bearer ')) {
    resetToken = resetToken.slice(7).trim();
  }

  const { password } = req.body;

  const { error } = passwordSchema.validate({ password });
  if (error) return res.status(200).json({ status: false, message: error.details[0].message });

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) return res.status(404).json({ status: false, message: 'User not found.' });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.status(200).json({ status: true, message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired token.' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If you have DB, fetch user here by decoded.id

    const userData = await User.findOne({ where: { email: decoded.email } });    

    return res.json({status: true, message: "User profile fetched successfully", data: userData});
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};