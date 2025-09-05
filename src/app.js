const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({origin:"*"}));
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');

const authRoutes = require('./routes/auth.routes');

app.use(express.json());
// ==============================Admin Routes======================================
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/roles', roleRoutes);

// ==============================Admin Routes======================================
app.use('/api/auth', authRoutes);

module.exports = app;
