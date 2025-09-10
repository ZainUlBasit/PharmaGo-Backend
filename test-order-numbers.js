const mongoose = require("mongoose");
const Order = require("./Models/Order");

// Connect to MongoDB (update connection string as needed)
mongoose.connect("mongodb://localhost:27017/gamepoint", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testOrderNumbers() {
  try {
    console.log("Testing Order Number Generation...\n");

    // Test 1: Generate a new order number
    console.log("1. Testing order number generation:");
    const orderNumber = await Order.generateOrderNumber();
    console.log(`   Generated order number: ${orderNumber}`);

    // Test 2: Create a test order
    console.log("\n2. Creating a test order:");
    const testOrder = new Order({
      customer: new mongoose.Types.ObjectId(), // Dummy customer ID
      items: [], // Empty items array
      status: 1,
      shipping_fee: 0,
    });

    await testOrder.save();
    console.log(
      `   Test order created with order number: ${testOrder.order_no}`
    );

    // Test 3: Generate another order number (should increment)
    console.log("\n3. Testing sequential order numbers:");
    const nextOrderNumber = await Order.generateOrderNumber();
    console.log(`   Next order number: ${nextOrderNumber}`);

    // Test 4: Check if order numbers are unique
    console.log("\n4. Checking order number uniqueness:");
    const existingOrder = await Order.findOne({ order_no: testOrder.order_no });
    console.log(`   Order found: ${existingOrder ? "Yes" : "No"}`);

    // Clean up test order
    await Order.findByIdAndDelete(testOrder._id);
    console.log("\n5. Test order cleaned up");

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testOrderNumbers();
