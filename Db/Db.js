require('dotenv').config();
const mongoose = require('mongoose');

const connectToDb = () => {
  const dbUri = process.env.MONGO_URI;
  if (!dbUri) {
    console.error('MONGO_URI not defined in .env');
    return;
  }

  mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected successfully'))
    .catch((err) => {
      console.error('Error connecting to database:', err.message);
      process.exit(1);
    });
};

module.exports = connectToDb ;
