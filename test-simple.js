const mongoose = require("mongoose");

// Connect to MongoDB (update connection string as needed)
mongoose.connect("mongodb://localhost:27017/gamepoint", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testOrderCreation() {
  try {
    console.log("Testing Order Creation...\n");
    
    // Import the Order model
    const Order = require("./Models/Order");
    
    // Test creating a new order
    console.log("1. Creating a test order:");
    const testOrder = new Order({
      customer: new mongoose.Types.ObjectId(), // Dummy customer ID
      items: [], // Empty items array
      status: 1,
      shipping_fee: 0,
    });
    
    console.log("   Order created, saving...");
    await testOrder.save();
    console.log(`   ✅ Order saved successfully with order number: ${testOrder.order_no}`);
    
    // Clean up test order
    await Order.findByIdAndDelete(testOrder._id);
    console.log("   Test order cleaned up");
    
    console.log("\n✅ Test passed! Order number generation is working.");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testOrderCreation();
