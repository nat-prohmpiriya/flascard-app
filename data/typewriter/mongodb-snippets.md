# MongoDB Snippets

## Find All Documents
- difficulty: easy
- description: Retrieve all documents from a collection

```javascript
db.users.find({});
```

## Find with Equality Filter
- difficulty: easy
- description: Find documents where a field equals a specific value

```javascript
db.users.find({ status: "active" });
```

## Find with Multiple Conditions
- difficulty: easy
- description: Find documents matching multiple field conditions (implicit AND)

```javascript
db.users.find({
  status: "active",
  role: "admin",
  verified: true
});
```

## Find with Projection
- difficulty: easy
- description: Return only specific fields from matching documents

```javascript
db.users.find(
  { status: "active" },
  { name: 1, email: 1, _id: 0 }
);
```

## Find One Document
- difficulty: easy
- description: Retrieve the first document matching the query

```javascript
db.users.findOne({ email: "user@example.com" });
```

## Find with Comparison Operators
- difficulty: easy
- description: Use comparison operators to filter by numeric values

```javascript
db.products.find({
  price: { $gte: 100, $lte: 500 },
  stock: { $gt: 0 }
});
```

## Find with $in Operator
- difficulty: easy
- description: Match documents where field value is in an array of values

```javascript
db.orders.find({
  status: { $in: ["pending", "processing", "shipped"] }
});
```

## Find with $nin Operator
- difficulty: easy
- description: Match documents where field value is NOT in an array of values

```javascript
db.users.find({
  role: { $nin: ["banned", "suspended", "deleted"] }
});
```

## Find with $ne Operator
- difficulty: easy
- description: Match documents where field does not equal a value

```javascript
db.products.find({
  category: { $ne: "discontinued" },
  stock: { $ne: 0 }
});
```

## Find with $exists Operator
- difficulty: easy
- description: Match documents where a field exists or does not exist

```javascript
db.users.find({
  profilePicture: { $exists: true },
  deletedAt: { $exists: false }
});
```

## Find with $type Operator
- difficulty: medium
- description: Match documents where field is of a specific BSON type

```javascript
db.logs.find({
  metadata: { $type: "object" },
  timestamp: { $type: "date" }
});
```

## Find with $or Operator
- difficulty: easy
- description: Match documents that satisfy at least one condition

```javascript
db.products.find({
  $or: [
    { stock: 0 },
    { discontinued: true },
    { expiryDate: { $lt: new Date() } }
  ]
});
```

## Find with $and Operator
- difficulty: easy
- description: Explicitly specify AND condition for multiple expressions

```javascript
db.products.find({
  $and: [
    { price: { $gte: 50 } },
    { price: { $lte: 200 } },
    { $or: [{ category: "electronics" }, { featured: true }] }
  ]
});
```

## Find with $not Operator
- difficulty: medium
- description: Invert the effect of a query expression

```javascript
db.users.find({
  age: { $not: { $lt: 18 } },
  email: { $not: /spam\.com$/ }
});
```

## Find with $nor Operator
- difficulty: medium
- description: Match documents that fail all specified conditions

```javascript
db.tasks.find({
  $nor: [
    { status: "completed" },
    { status: "cancelled" },
    { deletedAt: { $exists: true } }
  ]
});
```

## Find with Regex
- difficulty: medium
- description: Match documents using regular expression pattern

```javascript
db.products.find({
  name: { $regex: /^iPhone/i },
  description: { $regex: "wireless", $options: "i" }
});
```

## Find with $elemMatch on Array
- difficulty: medium
- description: Match documents where array element satisfies all conditions

```javascript
db.orders.find({
  items: {
    $elemMatch: {
      productId: ObjectId("64a1b2c3d4e5f6g7h8i9j0k1"),
      quantity: { $gte: 2 },
      price: { $lt: 100 }
    }
  }
});
```

## Find with Array Contains
- difficulty: easy
- description: Match documents where array contains a specific value

```javascript
db.articles.find({
  tags: "mongodb"
});
```

## Find with $all Operator
- difficulty: medium
- description: Match documents where array contains all specified values

```javascript
db.articles.find({
  tags: { $all: ["mongodb", "database", "nosql"] }
});
```

## Find with $size Operator
- difficulty: easy
- description: Match documents where array has exact number of elements

```javascript
db.users.find({
  friends: { $size: 5 }
});
```

## Find with Array Index
- difficulty: medium
- description: Query array element at specific index position

```javascript
db.surveys.find({
  "answers.0": "yes",
  "scores.2": { $gte: 80 }
});
```

## Find Nested Document Field
- difficulty: easy
- description: Query fields within embedded documents using dot notation

```javascript
db.users.find({
  "address.city": "Bangkok",
  "address.country": "Thailand",
  "preferences.notifications.email": true
});
```

## Sort Results
- difficulty: easy
- description: Order query results by one or more fields

```javascript
db.products.find({ category: "electronics" })
  .sort({ price: -1, name: 1 });
```

## Limit and Skip Results
- difficulty: easy
- description: Implement pagination with limit and skip

```javascript
const page = 3;
const pageSize = 20;

db.products.find({ status: "active" })
  .sort({ createdAt: -1 })
  .skip((page - 1) * pageSize)
  .limit(pageSize);
```

## Count Documents
- difficulty: easy
- description: Count documents matching a query condition

```javascript
db.orders.countDocuments({
  status: "completed",
  createdAt: { $gte: new Date("2024-01-01") }
});
```

## Distinct Values
- difficulty: easy
- description: Get unique values for a field across all documents

```javascript
db.products.distinct("category", { status: "active" });
```

## Insert One Document
- difficulty: easy
- description: Insert a single document into a collection

```javascript
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  createdAt: new Date(),
  settings: {
    theme: "dark",
    notifications: true
  }
});
```

## Insert Many Documents
- difficulty: easy
- description: Insert multiple documents in a single operation

```javascript
db.products.insertMany([
  { name: "Product A", price: 99.99, stock: 100 },
  { name: "Product B", price: 149.99, stock: 50 },
  { name: "Product C", price: 199.99, stock: 25 }
], { ordered: false });
```

## Update One Document
- difficulty: easy
- description: Update the first document matching the filter

```javascript
db.users.updateOne(
  { email: "john@example.com" },
  {
    $set: {
      name: "John Smith",
      updatedAt: new Date()
    }
  }
);
```

## Update Many Documents
- difficulty: easy
- description: Update all documents matching the filter

```javascript
db.products.updateMany(
  { stock: 0 },
  {
    $set: { status: "out_of_stock" },
    $currentDate: { updatedAt: true }
  }
);
```

## Update with $inc Operator
- difficulty: easy
- description: Increment or decrement numeric field values

```javascript
db.products.updateOne(
  { _id: ObjectId("64a1b2c3d4e5f6g7h8i9j0k1") },
  {
    $inc: {
      stock: -1,
      soldCount: 1,
      viewCount: 1
    }
  }
);
```

## Update with $mul Operator
- difficulty: medium
- description: Multiply field value by a number

```javascript
db.products.updateMany(
  { category: "electronics" },
  {
    $mul: { price: 0.9 }
  }
);
```

## Update with $min and $max
- difficulty: medium
- description: Update field only if new value is less/greater than current

```javascript
db.products.updateOne(
  { _id: productId },
  {
    $min: { lowestPrice: currentPrice },
    $max: { highestPrice: currentPrice }
  }
);
```

## Update with $rename
- difficulty: easy
- description: Rename a field in matching documents

```javascript
db.users.updateMany(
  {},
  {
    $rename: {
      "firstName": "first_name",
      "lastName": "last_name"
    }
  }
);
```

## Update with $unset
- difficulty: easy
- description: Remove fields from matching documents

```javascript
db.users.updateMany(
  { status: "deleted" },
  {
    $unset: {
      password: "",
      email: "",
      personalData: ""
    }
  }
);
```

## Update with $push
- difficulty: easy
- description: Append a value to an array field

```javascript
db.users.updateOne(
  { _id: userId },
  {
    $push: {
      notifications: {
        message: "New follower",
        read: false,
        createdAt: new Date()
      }
    }
  }
);
```

## Update with $push and $each
- difficulty: medium
- description: Append multiple values to an array field

```javascript
db.playlists.updateOne(
  { _id: playlistId },
  {
    $push: {
      songs: {
        $each: [songId1, songId2, songId3],
        $position: 0
      }
    }
  }
);
```

## Update with $push, $slice and $sort
- difficulty: hard
- description: Maintain a fixed-size sorted array

```javascript
db.users.updateOne(
  { _id: userId },
  {
    $push: {
      recentScores: {
        $each: [{ score: 95, date: new Date() }],
        $sort: { score: -1 },
        $slice: 10
      }
    }
  }
);
```

## Update with $addToSet
- difficulty: easy
- description: Add value to array only if it doesn't exist

```javascript
db.users.updateOne(
  { _id: userId },
  {
    $addToSet: {
      tags: "premium",
      roles: { $each: ["editor", "reviewer"] }
    }
  }
);
```

## Update with $pull
- difficulty: easy
- description: Remove all matching values from an array

```javascript
db.users.updateOne(
  { _id: userId },
  {
    $pull: {
      notifications: { read: true },
      blockedUsers: blockedUserId
    }
  }
);
```

## Update with $pullAll
- difficulty: easy
- description: Remove all instances of specified values from array

```javascript
db.playlists.updateOne(
  { _id: playlistId },
  {
    $pullAll: {
      songs: [songId1, songId2, songId3]
    }
  }
);
```

## Update with $pop
- difficulty: easy
- description: Remove first or last element from an array

```javascript
db.queues.updateOne(
  { _id: queueId },
  {
    $pop: { items: -1 }
  }
);
```

## Update Array Element by Index
- difficulty: medium
- description: Update specific array element using positional index

```javascript
db.users.updateOne(
  { _id: userId },
  {
    $set: {
      "addresses.0.isDefault": true,
      "addresses.1.isDefault": false
    }
  }
);
```

## Update Array Element with $
- difficulty: medium
- description: Update first matching array element using positional operator

```javascript
db.orders.updateOne(
  {
    _id: orderId,
    "items.productId": productId
  },
  {
    $set: { "items.$.quantity": 5 },
    $inc: { "items.$.price": -10 }
  }
);
```

## Update All Array Elements with $[]
- difficulty: medium
- description: Update all elements in an array

```javascript
db.orders.updateMany(
  { status: "pending" },
  {
    $set: { "items.$[].status": "processing" }
  }
);
```

## Update Filtered Array Elements with $[identifier]
- difficulty: hard
- description: Update array elements matching a filter condition

```javascript
db.orders.updateOne(
  { _id: orderId },
  {
    $set: { "items.$[elem].shipped": true }
  },
  {
    arrayFilters: [{ "elem.quantity": { $gte: 5 } }]
  }
);
```

## Upsert Document
- difficulty: medium
- description: Insert document if no match found, otherwise update

```javascript
db.pageViews.updateOne(
  { url: "/products/123", date: "2024-01-15" },
  {
    $inc: { count: 1 },
    $setOnInsert: {
      url: "/products/123",
      date: "2024-01-15",
      createdAt: new Date()
    }
  },
  { upsert: true }
);
```

## Find and Modify
- difficulty: medium
- description: Atomically find and update a document, returning the result

```javascript
db.counters.findOneAndUpdate(
  { _id: "orderId" },
  { $inc: { seq: 1 } },
  {
    returnDocument: "after",
    upsert: true
  }
);
```

## Replace Document
- difficulty: medium
- description: Replace entire document except for _id field

```javascript
db.users.replaceOne(
  { _id: userId },
  {
    name: "New Name",
    email: "new@example.com",
    role: "admin",
    createdAt: new Date(),
    version: 2
  }
);
```

## Delete One Document
- difficulty: easy
- description: Delete the first document matching the filter

```javascript
db.sessions.deleteOne({
  token: "expired-token-123"
});
```

## Delete Many Documents
- difficulty: easy
- description: Delete all documents matching the filter

```javascript
db.logs.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});
```

## Find and Delete
- difficulty: medium
- description: Atomically find and delete a document, returning it

```javascript
const deletedJob = db.jobQueue.findOneAndDelete(
  { status: "pending" },
  { sort: { priority: -1, createdAt: 1 } }
);
```

## Bulk Write Operations
- difficulty: hard
- description: Execute multiple write operations in a single request

```javascript
db.products.bulkWrite([
  {
    insertOne: {
      document: { name: "New Product", price: 99 }
    }
  },
  {
    updateOne: {
      filter: { _id: productId1 },
      update: { $inc: { stock: -1 } }
    }
  },
  {
    updateMany: {
      filter: { category: "sale" },
      update: { $mul: { price: 0.8 } }
    }
  },
  {
    deleteOne: {
      filter: { _id: productId2 }
    }
  }
], { ordered: false });
```

## Aggregation Pipeline Basic
- difficulty: medium
- description: Chain multiple stages to process and transform documents

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$total" },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
]);
```

## Aggregation $project Stage
- difficulty: medium
- description: Reshape documents by including, excluding, or computing fields

```javascript
db.users.aggregate([
  {
    $project: {
      fullName: { $concat: ["$firstName", " ", "$lastName"] },
      email: 1,
      yearJoined: { $year: "$createdAt" },
      isAdmin: { $eq: ["$role", "admin"] },
      _id: 0
    }
  }
]);
```

## Aggregation $addFields Stage
- difficulty: medium
- description: Add new fields to documents without removing existing ones

```javascript
db.products.aggregate([
  {
    $addFields: {
      totalValue: { $multiply: ["$price", "$stock"] },
      isLowStock: { $lt: ["$stock", 10] },
      priceWithTax: { $multiply: ["$price", 1.07] }
    }
  }
]);
```

## Aggregation $unwind Stage
- difficulty: medium
- description: Deconstruct array field into separate documents

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      totalSold: { $sum: "$items.quantity" },
      revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
    }
  },
  { $sort: { revenue: -1 } }
]);
```

## Aggregation $lookup Basic
- difficulty: medium
- description: Perform left outer join with another collection

```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: "$customer" },
  {
    $project: {
      orderNumber: 1,
      total: 1,
      customerName: "$customer.name",
      customerEmail: "$customer.email"
    }
  }
]);
```

## Aggregation $lookup with Pipeline
- difficulty: hard
- description: Perform correlated subquery join with custom pipeline

```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "products",
      let: { productIds: "$items.productId" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$_id", "$$productIds"] }
          }
        },
        {
          $project: { name: 1, category: 1, price: 1 }
        }
      ],
      as: "productDetails"
    }
  }
]);
```

## Aggregation $group with Accumulators
- difficulty: medium
- description: Group documents and compute aggregate values

```javascript
db.sales.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$date" },
        month: { $month: "$date" }
      },
      totalRevenue: { $sum: "$amount" },
      avgOrderValue: { $avg: "$amount" },
      maxOrder: { $max: "$amount" },
      minOrder: { $min: "$amount" },
      orderCount: { $sum: 1 },
      uniqueCustomers: { $addToSet: "$customerId" }
    }
  },
  {
    $addFields: {
      customerCount: { $size: "$uniqueCustomers" }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } }
]);
```

## Aggregation $bucket
- difficulty: hard
- description: Categorize documents into groups based on boundaries

```javascript
db.products.aggregate([
  {
    $bucket: {
      groupBy: "$price",
      boundaries: [0, 50, 100, 200, 500, Infinity],
      default: "Unknown",
      output: {
        count: { $sum: 1 },
        products: { $push: "$name" },
        avgPrice: { $avg: "$price" }
      }
    }
  }
]);
```

## Aggregation $facet
- difficulty: hard
- description: Process multiple aggregation pipelines in single stage

```javascript
db.products.aggregate([
  {
    $facet: {
      byCategory: [
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      priceStats: [
        {
          $group: {
            _id: null,
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" }
          }
        }
      ],
      topProducts: [
        { $sort: { soldCount: -1 } },
        { $limit: 5 },
        { $project: { name: 1, soldCount: 1 } }
      ]
    }
  }
]);
```

## Aggregation $graphLookup
- difficulty: hard
- description: Perform recursive search on a collection

```javascript
db.employees.aggregate([
  { $match: { name: "CEO" } },
  {
    $graphLookup: {
      from: "employees",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "managerId",
      as: "allReports",
      maxDepth: 5,
      depthField: "level"
    }
  },
  {
    $project: {
      name: 1,
      directReports: {
        $filter: {
          input: "$allReports",
          cond: { $eq: ["$$this.level", 0] }
        }
      },
      totalReports: { $size: "$allReports" }
    }
  }
]);
```

## Aggregation $out Stage
- difficulty: medium
- description: Write aggregation results to a new collection

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$total" },
      orderCount: { $sum: 1 },
      lastOrder: { $max: "$createdAt" }
    }
  },
  {
    $out: "customer_stats"
  }
]);
```

## Aggregation $merge Stage
- difficulty: hard
- description: Merge aggregation results into existing collection

```javascript
db.dailySales.aggregate([
  { $match: { date: new Date("2024-01-15") } },
  {
    $group: {
      _id: "$productId",
      dailySales: { $sum: "$quantity" },
      dailyRevenue: { $sum: "$total" }
    }
  },
  {
    $merge: {
      into: "productStats",
      on: "_id",
      whenMatched: [
        {
          $set: {
            totalSales: { $add: ["$totalSales", "$$new.dailySales"] },
            totalRevenue: { $add: ["$totalRevenue", "$$new.dailyRevenue"] },
            lastUpdated: new Date()
          }
        }
      ],
      whenNotMatched: "insert"
    }
  }
]);
```

## Aggregation Date Operators
- difficulty: medium
- description: Extract and manipulate date components in aggregation

```javascript
db.orders.aggregate([
  {
    $project: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
      dayOfWeek: { $dayOfWeek: "$createdAt" },
      hour: { $hour: "$createdAt" },
      formattedDate: {
        $dateToString: {
          format: "%Y-%m-%d %H:%M",
          date: "$createdAt"
        }
      },
      daysSinceOrder: {
        $dateDiff: {
          startDate: "$createdAt",
          endDate: "$$NOW",
          unit: "day"
        }
      }
    }
  }
]);
```

## Aggregation String Operators
- difficulty: medium
- description: Manipulate string fields in aggregation pipeline

```javascript
db.users.aggregate([
  {
    $project: {
      username: { $toLower: "$username" },
      initials: {
        $concat: [
          { $substr: ["$firstName", 0, 1] },
          { $substr: ["$lastName", 0, 1] }
        ]
      },
      emailDomain: {
        $arrayElemAt: [
          { $split: ["$email", "@"] },
          1
        ]
      },
      nameLength: { $strLenCP: "$firstName" }
    }
  }
]);
```

## Aggregation Array Operators
- difficulty: medium
- description: Process and transform arrays in aggregation

```javascript
db.orders.aggregate([
  {
    $project: {
      itemCount: { $size: "$items" },
      firstItem: { $arrayElemAt: ["$items", 0] },
      lastItem: { $arrayElemAt: ["$items", -1] },
      itemNames: "$items.name",
      hasExpensiveItem: {
        $anyElementTrue: {
          $map: {
            input: "$items",
            as: "item",
            in: { $gt: ["$$item.price", 100] }
          }
        }
      },
      totalQuantity: {
        $reduce: {
          input: "$items",
          initialValue: 0,
          in: { $add: ["$$value", "$$this.quantity"] }
        }
      }
    }
  }
]);
```

## Aggregation $filter Array
- difficulty: medium
- description: Filter array elements based on condition

```javascript
db.orders.aggregate([
  {
    $project: {
      orderNumber: 1,
      expensiveItems: {
        $filter: {
          input: "$items",
          as: "item",
          cond: { $gte: ["$$item.price", 50] }
        }
      },
      inStockItems: {
        $filter: {
          input: "$items",
          cond: { $gt: ["$$this.stock", 0] }
        }
      }
    }
  }
]);
```

## Aggregation $map Array
- difficulty: medium
- description: Apply expression to each array element

```javascript
db.orders.aggregate([
  {
    $project: {
      orderNumber: 1,
      itemsWithTax: {
        $map: {
          input: "$items",
          as: "item",
          in: {
            name: "$$item.name",
            quantity: "$$item.quantity",
            priceWithTax: { $multiply: ["$$item.price", 1.07] },
            subtotal: {
              $multiply: [
                "$$item.quantity",
                { $multiply: ["$$item.price", 1.07] }
              ]
            }
          }
        }
      }
    }
  }
]);
```

## Aggregation Conditional Expressions
- difficulty: medium
- description: Use conditional logic in aggregation pipeline

```javascript
db.users.aggregate([
  {
    $project: {
      name: 1,
      tier: {
        $switch: {
          branches: [
            { case: { $gte: ["$totalSpent", 10000] }, then: "platinum" },
            { case: { $gte: ["$totalSpent", 5000] }, then: "gold" },
            { case: { $gte: ["$totalSpent", 1000] }, then: "silver" }
          ],
          default: "bronze"
        }
      },
      status: {
        $cond: {
          if: { $gt: ["$lastLoginAt", thirtyDaysAgo] },
          then: "active",
          else: "inactive"
        }
      },
      displayName: { $ifNull: ["$nickname", "$name"] }
    }
  }
]);
```

## Create Single Field Index
- difficulty: easy
- description: Create index on a single field for faster queries

```javascript
db.users.createIndex(
  { email: 1 },
  { unique: true }
);
```

## Create Compound Index
- difficulty: medium
- description: Create index on multiple fields

```javascript
db.orders.createIndex(
  { customerId: 1, createdAt: -1, status: 1 },
  { name: "customer_orders_idx" }
);
```

## Create Text Index
- difficulty: medium
- description: Create text index for full-text search

```javascript
db.articles.createIndex(
  {
    title: "text",
    content: "text",
    tags: "text"
  },
  {
    weights: {
      title: 10,
      tags: 5,
      content: 1
    },
    default_language: "english"
  }
);
```

## Text Search Query
- difficulty: medium
- description: Perform full-text search on indexed fields

```javascript
db.articles.find(
  {
    $text: {
      $search: "mongodb database nosql",
      $caseSensitive: false
    }
  },
  {
    score: { $meta: "textScore" }
  }
).sort({ score: { $meta: "textScore" } });
```

## Create TTL Index
- difficulty: medium
- description: Create index that automatically deletes expired documents

```javascript
db.sessions.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

db.logs.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
);
```

## Create Partial Index
- difficulty: hard
- description: Create index only for documents matching a filter

```javascript
db.orders.createIndex(
  { customerId: 1, createdAt: -1 },
  {
    partialFilterExpression: {
      status: "active",
      total: { $gt: 100 }
    }
  }
);
```

## Create 2dsphere Index
- difficulty: medium
- description: Create geospatial index for location queries

```javascript
db.stores.createIndex({ location: "2dsphere" });

db.stores.insertOne({
  name: "Store A",
  location: {
    type: "Point",
    coordinates: [100.5018, 13.7563]
  }
});
```

## Geospatial $near Query
- difficulty: medium
- description: Find documents near a geographic point

```javascript
db.stores.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [100.5018, 13.7563]
      },
      $maxDistance: 5000
    }
  }
});
```

## Geospatial $geoWithin Query
- difficulty: hard
- description: Find documents within a geographic region

```javascript
db.stores.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[
          [100.4, 13.7],
          [100.6, 13.7],
          [100.6, 13.8],
          [100.4, 13.8],
          [100.4, 13.7]
        ]]
      }
    }
  }
});
```

## Transaction Basic
- difficulty: hard
- description: Execute multiple operations atomically with transaction

```javascript
const session = db.getMongo().startSession();
session.startTransaction();

try {
  const orders = session.getDatabase("shop").orders;
  const inventory = session.getDatabase("shop").inventory;

  orders.insertOne({
    customerId: customerId,
    items: [{ productId: productId, quantity: 2 }],
    total: 199.98
  }, { session });

  inventory.updateOne(
    { _id: productId },
    { $inc: { stock: -2 } },
    { session }
  );

  session.commitTransaction();
} catch (error) {
  session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Schema Validation
- difficulty: hard
- description: Define JSON schema validation rules for a collection

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150
        },
        role: {
          enum: ["user", "admin", "moderator"]
        },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
```

## Change Stream Watch
- difficulty: hard
- description: Watch for real-time changes on a collection

```javascript
const pipeline = [
  {
    $match: {
      operationType: { $in: ["insert", "update", "delete"] },
      "fullDocument.status": "urgent"
    }
  }
];

const changeStream = db.orders.watch(pipeline, {
  fullDocument: "updateLookup"
});

changeStream.on("change", (change) => {
  console.log("Change detected:", change.operationType);
  console.log("Document:", change.fullDocument);
});
```

## Explain Query Plan
- difficulty: medium
- description: Analyze query execution plan for optimization

```javascript
db.orders.find({
  customerId: ObjectId("64a1b2c3d4e5f6g7h8i9j0k1"),
  status: "completed"
}).explain("executionStats");
```

## Collection Stats
- difficulty: easy
- description: Get statistics about a collection

```javascript
db.orders.stats({ scale: 1024 * 1024 });
db.runCommand({ collStats: "orders", scale: 1048576 });
```

## Create View
- difficulty: hard
- description: Create a read-only view with aggregation pipeline

```javascript
db.createView("activeCustomerOrders", "orders", [
  {
    $match: { status: { $ne: "cancelled" } }
  },
  {
    $lookup: {
      from: "users",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: "$customer" },
  {
    $project: {
      orderNumber: 1,
      total: 1,
      status: 1,
      customerName: "$customer.name",
      customerEmail: "$customer.email",
      createdAt: 1
    }
  }
]);
```

## MongoDB Driver Connection
- difficulty: medium
- description: Connect to MongoDB using Node.js driver

```javascript
import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  w: "majority"
});

async function run() {
  try {
    await client.connect();
    const db = client.db("myapp");
    const users = db.collection("users");

    const result = await users.findOne({ email: "test@example.com" });
    console.log(result);
  } finally {
    await client.close();
  }
}
```

## Mongoose Schema Definition
- difficulty: medium
- description: Define Mongoose schema with types and validation

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { type: String, required: true },
  age: { type: Number, min: 0, max: 150 },
  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user"
  },
  settings: {
    theme: { type: String, default: "light" },
    notifications: { type: Boolean, default: true }
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

userSchema.virtual("isAdmin").get(function() {
  return this.role === "admin";
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model("User", userSchema);
```

## Mongoose Middleware Hooks
- difficulty: hard
- description: Define pre and post middleware hooks in Mongoose

```javascript
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  passwordChangedAt: Date
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ deletedAt: { $exists: false } });
  next();
});

userSchema.post("save", function(doc) {
  console.log(`User ${doc.email} saved successfully`);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

## Mongoose Population
- difficulty: medium
- description: Populate references to other documents

```javascript
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    quantity: Number,
    price: Number
  }],
  status: String
});

const orders = await Order.find({ status: "pending" })
  .populate("customer", "name email")
  .populate({
    path: "items.product",
    select: "name category price",
    match: { inStock: true }
  })
  .sort({ createdAt: -1 })
  .lean();
```

## Mongoose Aggregate with TypeScript
- difficulty: hard
- description: Type-safe aggregation pipeline with Mongoose

```typescript
import mongoose, { PipelineStage } from "mongoose";

interface SalesReport {
  _id: { year: number; month: number };
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

const pipeline: PipelineStage[] = [
  {
    $match: {
      status: "completed",
      createdAt: { $gte: new Date("2024-01-01") }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      totalRevenue: { $sum: "$total" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$total" }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } }
];

const results = await Order.aggregate<SalesReport>(pipeline);
```
