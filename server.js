require('dotenv').config();
const app = require('./src/app');
const db = require('./models');

const PORT = process.env.PORT || 5000;

// Sync DB and start server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
