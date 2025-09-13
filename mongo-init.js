// MongoDB initialization script
db = db.getSiblingDB('ecommerce');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('orders');
db.createCollection('carts');
db.createCollection('addresses');
db.createCollection('favourites');
db.createCollection('ratings');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ "phone": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { sparse: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "isActive": 1 });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.carts.createIndex({ "userId": 1 });
db.addresses.createIndex({ "userId": 1 });

print('E-commerce database initialized successfully!');
