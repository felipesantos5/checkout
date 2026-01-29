
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Sale = mongoose.model('Sale', new mongoose.Schema({
      paymentMethod: String,
      status: String,
      totalAmountInCents: Number
    }));

    const stats = await Sale.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { 
          _id: '$paymentMethod', 
          count: { $sum: 1 }, 
          total: { $sum: '$totalAmountInCents' } 
      }}
    ]);

    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
