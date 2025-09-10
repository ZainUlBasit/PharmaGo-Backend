# Order Number System Implementation

## Overview

The Order model now includes an auto-incrementing `order_no` field that follows the format `YYYYMMDD00001`.

## Format

- **YYYY**: 4-digit year (e.g., 2025)
- **MM**: 2-digit month (e.g., 08 for August)
- **DD**: 2-digit day (e.g., 31)
- **00001**: 5-digit sequential number starting from 00001 each day

## Examples

- `2025083100001` - First order on August 31, 2025
- `2025083100002` - Second order on August 31, 2025
- `2025090100001` - First order on September 1, 2025

## Features

### 1. Auto-Generation

- Order numbers are automatically generated when creating new orders
- No manual input required
- Ensures uniqueness across the system

### 2. Daily Reset

- Sequence resets to 00001 each day
- Allows for up to 99,999 orders per day
- Prevents sequence conflicts between different dates

### 3. Database Indexing

- `order_no` field is indexed for efficient querying
- Unique constraint ensures no duplicate order numbers

## Implementation Details

### Schema Changes

```javascript
const OrderSchema = new Schema({
  order_no: { type: String, unique: true, required: true },
  // ... other fields
});
```

### Pre-Save Middleware

- Automatically generates order numbers for new orders
- Only triggers for new documents without existing order numbers

### Static Methods

- `Order.generateOrderNumber()` - Generates the next available order number
- `Order.ensureOrderNumbers()` - Updates existing orders without order numbers

## API Endpoints

### Ensure Order Numbers

```
POST /api/orders/ensure-order-numbers
```

- Updates all existing orders that don't have order numbers
- Useful for migrating existing data
- Returns count of updated orders

## Usage Examples

### Creating a New Order

```javascript
const newOrder = new Order({
  customer: customerId,
  items: [cartItem],
  status: 1,
  shipping_fee: 5.99,
  // order_no will be auto-generated
});

await newOrder.save();
console.log(newOrder.order_no); // e.g., "2025083100001"
```

### Generating Order Numbers Manually

```javascript
const orderNumber = await Order.generateOrderNumber();
console.log(orderNumber); // e.g., "2025083100002"
```

### Updating Existing Orders

```javascript
// For existing orders without order numbers
const updatedCount = await Order.ensureOrderNumbers();
console.log(`Updated ${updatedCount} orders`);
```

## Migration Notes

### For Existing Data

1. Run the `ensure-order-numbers` endpoint to update existing orders
2. All new orders will automatically get order numbers
3. No manual intervention required

### Database Considerations

- The `order_no` field is required and unique
- Existing orders without order numbers will be updated automatically
- Consider running the migration during low-traffic periods

## Testing

Run the test script to verify functionality:

```bash
node test-order-numbers.js
```

## Error Handling

- Duplicate order numbers are prevented by the unique constraint
- Database errors during generation are handled gracefully
- Fallback mechanisms ensure system stability

## Performance

- Order number generation is optimized with database indexing
- Minimal overhead during order creation
- Efficient querying by order number
