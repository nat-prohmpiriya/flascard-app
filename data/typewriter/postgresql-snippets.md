# SQL Snippets

## Select All Columns
- difficulty: easy
- description: Retrieve all columns from a table

```sql
SELECT * FROM users;
```

## Select Specific Columns
- difficulty: easy
- description: Retrieve only specific columns for better performance

```sql
SELECT id, name, email FROM users;
```

## Select with Alias
- difficulty: easy
- description: Rename columns in the result set using AS keyword

```sql
SELECT
  first_name AS "First Name",
  last_name AS "Last Name",
  email AS "Email Address"
FROM users;
```

## Where Clause Basic
- difficulty: easy
- description: Filter rows with a simple condition

```sql
SELECT * FROM products
WHERE price > 100;
```

## Where with Multiple Conditions
- difficulty: easy
- description: Combine conditions using AND/OR operators

```sql
SELECT * FROM orders
WHERE status = 'pending'
  AND created_at > '2024-01-01'
  AND (total_amount > 1000 OR priority = 'high');
```

## Where with IN Operator
- difficulty: easy
- description: Match against a list of values

```sql
SELECT * FROM products
WHERE category_id IN (1, 2, 3, 5)
  AND status IN ('active', 'featured');
```

## Where with BETWEEN
- difficulty: easy
- description: Filter values within a range (inclusive)

```sql
SELECT * FROM orders
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
  AND total_amount BETWEEN 100 AND 1000;
```

## Where with LIKE Pattern
- difficulty: easy
- description: Pattern matching with wildcards (% for any chars, _ for single char)

```sql
SELECT * FROM users
WHERE email LIKE '%@gmail.com'
  AND name LIKE 'John%'
  AND phone LIKE '+1-___-___-____';
```

## Where with ILIKE Case Insensitive
- difficulty: easy
- description: PostgreSQL case-insensitive pattern matching

```sql
SELECT * FROM products
WHERE name ILIKE '%laptop%'
  OR description ILIKE '%computer%';
```

## Where IS NULL / IS NOT NULL
- difficulty: easy
- description: Check for NULL values (cannot use = for NULL)

```sql
SELECT * FROM users
WHERE deleted_at IS NULL
  AND email_verified_at IS NOT NULL;
```

## Order By Single Column
- difficulty: easy
- description: Sort results by one column

```sql
SELECT * FROM products
ORDER BY price DESC;
```

## Order By Multiple Columns
- difficulty: easy
- description: Sort by multiple columns with different directions

```sql
SELECT * FROM orders
ORDER BY priority DESC, created_at ASC, id DESC;
```

## Order By with NULLS FIRST/LAST
- difficulty: medium
- description: Control NULL value positioning in sorted results

```sql
SELECT * FROM tasks
ORDER BY due_date ASC NULLS LAST,
         priority DESC NULLS FIRST;
```

## Limit and Offset
- difficulty: easy
- description: Pagination - limit results and skip rows

```sql
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;
```

## Distinct Values
- difficulty: easy
- description: Remove duplicate rows from results

```sql
SELECT DISTINCT category, brand
FROM products
WHERE status = 'active'
ORDER BY category, brand;
```

## Distinct On (PostgreSQL)
- difficulty: medium
- description: Get first row for each distinct value (PostgreSQL specific)

```sql
SELECT DISTINCT ON (user_id)
  user_id, order_id, total_amount, created_at
FROM orders
ORDER BY user_id, created_at DESC;
```

## Insert Single Row
- difficulty: easy
- description: Insert one row with specified columns

```sql
INSERT INTO users (name, email, password_hash)
VALUES ('John Doe', 'john@example.com', 'hashed_password');
```

## Insert with Returning
- difficulty: easy
- description: Insert and return the created row (PostgreSQL)

```sql
INSERT INTO products (name, price, category_id)
VALUES ('Wireless Mouse', 29.99, 3)
RETURNING id, name, created_at;
```

## Insert Multiple Rows
- difficulty: easy
- description: Batch insert multiple rows in one statement

```sql
INSERT INTO tags (name, slug, color)
VALUES
  ('Technology', 'technology', '#3B82F6'),
  ('Design', 'design', '#EC4899'),
  ('Business', 'business', '#10B981')
RETURNING *;
```

## Insert from Select
- difficulty: medium
- description: Insert rows from another query result

```sql
INSERT INTO order_archive (order_id, user_id, total, archived_at)
SELECT id, user_id, total_amount, NOW()
FROM orders
WHERE status = 'completed'
  AND created_at < NOW() - INTERVAL '1 year';
```

## Update Basic
- difficulty: easy
- description: Update rows matching a condition

```sql
UPDATE products
SET price = 99.99,
    updated_at = NOW()
WHERE id = 123;
```

## Update with Returning
- difficulty: easy
- description: Update and return modified rows

```sql
UPDATE users
SET last_login_at = NOW(),
    login_count = login_count + 1
WHERE id = 456
RETURNING id, name, login_count;
```

## Update from Another Table
- difficulty: medium
- description: Update using values from a joined table

```sql
UPDATE products p
SET category_name = c.name,
    updated_at = NOW()
FROM categories c
WHERE p.category_id = c.id
  AND p.category_name IS NULL;
```

## Update with Subquery
- difficulty: medium
- description: Update using a subquery to calculate new values

```sql
UPDATE products
SET avg_rating = (
  SELECT COALESCE(AVG(rating), 0)
  FROM reviews
  WHERE reviews.product_id = products.id
)
WHERE category_id = 5;
```

## Delete Basic
- difficulty: easy
- description: Delete rows matching a condition

```sql
DELETE FROM sessions
WHERE expires_at < NOW();
```

## Delete with Returning
- difficulty: easy
- description: Delete and return the deleted rows

```sql
DELETE FROM cart_items
WHERE user_id = 123
  AND created_at < NOW() - INTERVAL '7 days'
RETURNING id, product_id, quantity;
```

## Delete with Subquery
- difficulty: medium
- description: Delete based on related table conditions

```sql
DELETE FROM comments
WHERE user_id IN (
  SELECT id FROM users
  WHERE status = 'banned'
);
```

## Upsert with ON CONFLICT DO NOTHING
- difficulty: medium
- description: Insert or ignore if conflict on unique constraint

```sql
INSERT INTO user_preferences (user_id, theme, language)
VALUES (123, 'dark', 'en')
ON CONFLICT (user_id) DO NOTHING;
```

## Upsert with ON CONFLICT DO UPDATE
- difficulty: medium
- description: Insert or update on conflict (PostgreSQL UPSERT)

```sql
INSERT INTO page_views (page_id, view_date, view_count)
VALUES (456, CURRENT_DATE, 1)
ON CONFLICT (page_id, view_date)
DO UPDATE SET
  view_count = page_views.view_count + 1,
  updated_at = NOW();
```

## Upsert with EXCLUDED
- difficulty: medium
- description: Use EXCLUDED to reference the row that would be inserted

```sql
INSERT INTO inventory (product_id, warehouse_id, quantity, last_restock)
VALUES (101, 1, 50, NOW())
ON CONFLICT (product_id, warehouse_id)
DO UPDATE SET
  quantity = inventory.quantity + EXCLUDED.quantity,
  last_restock = EXCLUDED.last_restock
RETURNING *;
```

## Inner Join
- difficulty: easy
- description: Return rows that have matching values in both tables

```sql
SELECT
  o.id AS order_id,
  o.total_amount,
  u.name AS customer_name,
  u.email
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'completed';
```

## Left Join
- difficulty: easy
- description: Return all rows from left table, matched rows from right (NULL if no match)

```sql
SELECT
  u.id,
  u.name,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

## Right Join
- difficulty: easy
- description: Return all rows from right table, matched rows from left

```sql
SELECT
  p.id AS product_id,
  p.name,
  c.name AS category_name
FROM products p
RIGHT JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.name;
```

## Full Outer Join
- difficulty: medium
- description: Return all rows when there's a match in either table

```sql
SELECT
  COALESCE(e.name, 'Unassigned') AS employee,
  COALESCE(p.name, 'No Project') AS project
FROM employees e
FULL OUTER JOIN projects p ON e.project_id = p.id
ORDER BY e.name, p.name;
```

## Cross Join
- difficulty: medium
- description: Cartesian product - every row paired with every row

```sql
SELECT
  s.name AS size,
  c.name AS color,
  CONCAT(s.code, '-', c.code) AS sku_suffix
FROM sizes s
CROSS JOIN colors c
ORDER BY s.sort_order, c.sort_order;
```

## Self Join
- difficulty: medium
- description: Join a table to itself (for hierarchical or comparative data)

```sql
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY m.name, e.name;
```

## Multiple Joins
- difficulty: medium
- description: Join multiple tables in one query

```sql
SELECT
  o.id AS order_id,
  u.name AS customer,
  p.name AS product,
  oi.quantity,
  oi.unit_price,
  oi.quantity * oi.unit_price AS line_total
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.created_at > NOW() - INTERVAL '30 days';
```

## Join with Subquery
- difficulty: medium
- description: Join with a derived table (subquery in FROM clause)

```sql
SELECT
  u.name,
  u.email,
  stats.order_count,
  stats.total_spent
FROM users u
INNER JOIN (
  SELECT
    user_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
) stats ON u.id = stats.user_id
WHERE stats.total_spent > 1000;
```

## Lateral Join
- difficulty: hard
- description: Subquery can reference columns from preceding tables

```sql
SELECT
  u.name,
  recent_orders.order_id,
  recent_orders.total_amount,
  recent_orders.created_at
FROM users u
LEFT JOIN LATERAL (
  SELECT id AS order_id, total_amount, created_at
  FROM orders
  WHERE user_id = u.id
  ORDER BY created_at DESC
  LIMIT 3
) recent_orders ON true
ORDER BY u.name, recent_orders.created_at DESC;
```

## Count Aggregate
- difficulty: easy
- description: Count rows or non-null values

```sql
SELECT
  COUNT(*) AS total_orders,
  COUNT(shipped_at) AS shipped_orders,
  COUNT(DISTINCT user_id) AS unique_customers
FROM orders
WHERE created_at > NOW() - INTERVAL '30 days';
```

## Sum and Average
- difficulty: easy
- description: Calculate sum and average of numeric columns

```sql
SELECT
  SUM(quantity) AS total_items,
  SUM(quantity * unit_price) AS total_revenue,
  AVG(quantity * unit_price) AS avg_order_value,
  ROUND(AVG(quantity)::numeric, 2) AS avg_items_per_order
FROM order_items;
```

## Min, Max, and Range
- difficulty: easy
- description: Find minimum, maximum values and calculate range

```sql
SELECT
  MIN(price) AS cheapest,
  MAX(price) AS most_expensive,
  MAX(price) - MIN(price) AS price_range,
  ROUND(AVG(price)::numeric, 2) AS average_price
FROM products
WHERE status = 'active';
```

## Group By Basic
- difficulty: easy
- description: Group rows and calculate aggregates per group

```sql
SELECT
  category_id,
  COUNT(*) AS product_count,
  ROUND(AVG(price)::numeric, 2) AS avg_price,
  SUM(stock_quantity) AS total_stock
FROM products
WHERE status = 'active'
GROUP BY category_id;
```

## Group By Multiple Columns
- difficulty: medium
- description: Group by multiple columns for detailed breakdowns

```sql
SELECT
  EXTRACT(YEAR FROM created_at) AS year,
  EXTRACT(MONTH FROM created_at) AS month,
  status,
  COUNT(*) AS order_count,
  SUM(total_amount) AS revenue
FROM orders
GROUP BY
  EXTRACT(YEAR FROM created_at),
  EXTRACT(MONTH FROM created_at),
  status
ORDER BY year DESC, month DESC, status;
```

## Group By with Having
- difficulty: medium
- description: Filter groups based on aggregate conditions

```sql
SELECT
  user_id,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_spent,
  AVG(total_amount) AS avg_order_value
FROM orders
WHERE status = 'completed'
GROUP BY user_id
HAVING COUNT(*) >= 5
   AND SUM(total_amount) > 1000
ORDER BY total_spent DESC;
```

## Group By with Rollup
- difficulty: hard
- description: Generate subtotals and grand total with ROLLUP

```sql
SELECT
  COALESCE(category, 'ALL CATEGORIES') AS category,
  COALESCE(brand, 'All Brands') AS brand,
  COUNT(*) AS product_count,
  SUM(stock_quantity) AS total_stock
FROM products
GROUP BY ROLLUP(category, brand)
ORDER BY category NULLS LAST, brand NULLS LAST;
```

## Group By with Cube
- difficulty: hard
- description: Generate all combinations of subtotals with CUBE

```sql
SELECT
  region,
  product_category,
  EXTRACT(YEAR FROM sale_date) AS year,
  SUM(amount) AS total_sales
FROM sales
GROUP BY CUBE(region, product_category, EXTRACT(YEAR FROM sale_date))
ORDER BY region NULLS LAST, product_category NULLS LAST, year NULLS LAST;
```

## Grouping Sets
- difficulty: hard
- description: Define specific grouping combinations

```sql
SELECT
  brand,
  category,
  EXTRACT(YEAR FROM created_at) AS year,
  COUNT(*) AS count,
  SUM(price * stock_quantity) AS inventory_value
FROM products
GROUP BY GROUPING SETS (
  (brand),
  (category),
  (brand, category),
  (EXTRACT(YEAR FROM created_at)),
  ()
)
ORDER BY brand NULLS LAST, category NULLS LAST, year NULLS LAST;
```

## String Aggregation
- difficulty: medium
- description: Concatenate values from multiple rows into one string

```sql
SELECT
  o.id AS order_id,
  STRING_AGG(p.name, ', ' ORDER BY p.name) AS products,
  STRING_AGG(DISTINCT t.name, ', ') AS tags
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY o.id;
```

## Array Aggregation
- difficulty: medium
- description: Collect values into an array

```sql
SELECT
  user_id,
  ARRAY_AGG(DISTINCT role ORDER BY role) AS roles,
  ARRAY_AGG(permission ORDER BY permission) AS all_permissions
FROM user_roles ur
JOIN role_permissions rp ON ur.role = rp.role
GROUP BY user_id;
```

## JSON Aggregation
- difficulty: medium
- description: Aggregate rows into JSON array or object

```sql
SELECT
  u.id,
  u.name,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'order_id', o.id,
      'total', o.total_amount,
      'date', o.created_at
    ) ORDER BY o.created_at DESC
  ) AS recent_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

## Filter Clause
- difficulty: medium
- description: Apply different conditions to different aggregates

```sql
SELECT
  COUNT(*) AS total_orders,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  SUM(total_amount) FILTER (WHERE status = 'completed') AS completed_revenue
FROM orders
WHERE created_at > NOW() - INTERVAL '30 days';
```

## Subquery in WHERE
- difficulty: medium
- description: Use subquery to filter based on another query

```sql
SELECT * FROM products
WHERE category_id IN (
  SELECT id FROM categories
  WHERE parent_id = 5
)
AND price > (
  SELECT AVG(price) FROM products
);
```

## Correlated Subquery
- difficulty: medium
- description: Subquery that references the outer query

```sql
SELECT
  p.id,
  p.name,
  p.price,
  (
    SELECT COUNT(*)
    FROM order_items oi
    WHERE oi.product_id = p.id
  ) AS times_ordered,
  (
    SELECT AVG(rating)
    FROM reviews r
    WHERE r.product_id = p.id
  ) AS avg_rating
FROM products p
WHERE p.status = 'active';
```

## EXISTS Subquery
- difficulty: medium
- description: Check if subquery returns any rows

```sql
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.id
    AND o.status = 'completed'
    AND o.total_amount > 1000
)
AND NOT EXISTS (
  SELECT 1 FROM user_bans b
  WHERE b.user_id = u.id
    AND b.expires_at > NOW()
);
```

## Scalar Subquery in SELECT
- difficulty: medium
- description: Use subquery to compute a single value per row

```sql
SELECT
  c.id,
  c.name,
  (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count,
  (SELECT MAX(price) FROM products WHERE category_id = c.id) AS max_price,
  (SELECT MIN(price) FROM products WHERE category_id = c.id) AS min_price
FROM categories c
ORDER BY product_count DESC;
```

## CTE Basic
- difficulty: medium
- description: Common Table Expression for readable, reusable subqueries

```sql
WITH active_users AS (
  SELECT id, name, email
  FROM users
  WHERE status = 'active'
    AND last_login_at > NOW() - INTERVAL '30 days'
)
SELECT
  au.name,
  COUNT(o.id) AS recent_orders
FROM active_users au
LEFT JOIN orders o ON au.id = o.user_id
  AND o.created_at > NOW() - INTERVAL '30 days'
GROUP BY au.id, au.name
ORDER BY recent_orders DESC;
```

## Multiple CTEs
- difficulty: medium
- description: Chain multiple CTEs for complex queries

```sql
WITH monthly_sales AS (
  SELECT
    product_id,
    SUM(quantity) AS total_quantity,
    SUM(quantity * unit_price) AS total_revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.created_at > NOW() - INTERVAL '30 days'
  GROUP BY product_id
),
product_stats AS (
  SELECT
    p.id,
    p.name,
    p.category_id,
    COALESCE(ms.total_quantity, 0) AS quantity_sold,
    COALESCE(ms.total_revenue, 0) AS revenue
  FROM products p
  LEFT JOIN monthly_sales ms ON p.id = ms.product_id
)
SELECT
  c.name AS category,
  SUM(ps.quantity_sold) AS total_sold,
  SUM(ps.revenue) AS total_revenue,
  COUNT(CASE WHEN ps.quantity_sold > 0 THEN 1 END) AS active_products
FROM product_stats ps
JOIN categories c ON ps.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;
```

## CTE with INSERT
- difficulty: medium
- description: Use CTE with data modification statements

```sql
WITH moved_orders AS (
  DELETE FROM orders
  WHERE status = 'completed'
    AND created_at < NOW() - INTERVAL '1 year'
  RETURNING *
)
INSERT INTO order_archive (
  original_id, user_id, total_amount,
  status, created_at, archived_at
)
SELECT
  id, user_id, total_amount,
  status, created_at, NOW()
FROM moved_orders;
```

## Recursive CTE for Hierarchy
- difficulty: hard
- description: Traverse hierarchical data (org chart, categories, etc.)

```sql
WITH RECURSIVE category_tree AS (
  -- Base case: root categories
  SELECT
    id, name, parent_id,
    name AS path,
    1 AS level
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: children
  SELECT
    c.id, c.name, c.parent_id,
    ct.path || ' > ' || c.name,
    ct.level + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY path;
```

## Recursive CTE for Graph
- difficulty: hard
- description: Find all connected nodes in a graph structure

```sql
WITH RECURSIVE connected_users AS (
  -- Start with a specific user
  SELECT user_id, friend_id, 1 AS depth
  FROM friendships
  WHERE user_id = 1

  UNION

  -- Find friends of friends (up to depth 3)
  SELECT f.user_id, f.friend_id, cu.depth + 1
  FROM friendships f
  INNER JOIN connected_users cu ON f.user_id = cu.friend_id
  WHERE cu.depth < 3
)
SELECT DISTINCT friend_id, MIN(depth) AS degrees_of_separation
FROM connected_users
WHERE friend_id != 1
GROUP BY friend_id
ORDER BY degrees_of_separation, friend_id;
```

## Recursive CTE for Running Total
- difficulty: hard
- description: Calculate cumulative values row by row

```sql
WITH RECURSIVE running_balance AS (
  SELECT
    id,
    transaction_date,
    amount,
    amount AS balance,
    ROW_NUMBER() OVER (ORDER BY transaction_date, id) AS rn
  FROM transactions
  WHERE account_id = 123
    AND ROW_NUMBER() OVER (ORDER BY transaction_date, id) = 1

  UNION ALL

  SELECT
    t.id,
    t.transaction_date,
    t.amount,
    rb.balance + t.amount,
    rb.rn + 1
  FROM transactions t
  JOIN running_balance rb ON ROW_NUMBER() OVER (ORDER BY t.transaction_date, t.id) = rb.rn + 1
  WHERE t.account_id = 123
)
SELECT * FROM running_balance ORDER BY rn;
```

## Window Function ROW_NUMBER
- difficulty: medium
- description: Assign sequential numbers to rows within partitions

```sql
SELECT
  id,
  user_id,
  total_amount,
  created_at,
  ROW_NUMBER() OVER (
    PARTITION BY user_id
    ORDER BY created_at DESC
  ) AS order_rank
FROM orders
WHERE status = 'completed';
```

## Get Latest Per Group
- difficulty: medium
- description: Get most recent record for each group using ROW_NUMBER

```sql
WITH ranked_orders AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC
    ) AS rn
  FROM orders
)
SELECT * FROM ranked_orders
WHERE rn = 1;
```

## RANK and DENSE_RANK
- difficulty: medium
- description: Rank rows with gaps (RANK) or without gaps (DENSE_RANK)

```sql
SELECT
  name,
  department,
  salary,
  RANK() OVER (ORDER BY salary DESC) AS salary_rank,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_dense_rank,
  RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
  ) AS dept_rank
FROM employees;
```

## NTILE for Buckets
- difficulty: medium
- description: Distribute rows into N equal buckets

```sql
SELECT
  id,
  name,
  total_spent,
  NTILE(4) OVER (ORDER BY total_spent DESC) AS spending_quartile,
  CASE NTILE(4) OVER (ORDER BY total_spent DESC)
    WHEN 1 THEN 'Platinum'
    WHEN 2 THEN 'Gold'
    WHEN 3 THEN 'Silver'
    ELSE 'Bronze'
  END AS tier
FROM customers;
```

## LAG and LEAD
- difficulty: medium
- description: Access previous or next row values

```sql
SELECT
  date,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY date) AS prev_day_revenue,
  LEAD(revenue, 1) OVER (ORDER BY date) AS next_day_revenue,
  revenue - LAG(revenue, 1) OVER (ORDER BY date) AS daily_change,
  ROUND(
    100.0 * (revenue - LAG(revenue, 1) OVER (ORDER BY date))
    / LAG(revenue, 1) OVER (ORDER BY date),
    2
  ) AS pct_change
FROM daily_sales;
```

## FIRST_VALUE and LAST_VALUE
- difficulty: medium
- description: Get first or last value in window frame

```sql
SELECT
  date,
  product_id,
  price,
  FIRST_VALUE(price) OVER (
    PARTITION BY product_id
    ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS initial_price,
  LAST_VALUE(price) OVER (
    PARTITION BY product_id
    ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS current_price
FROM price_history;
```

## Running Total with Window
- difficulty: medium
- description: Calculate cumulative sum using window function

```sql
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) AS running_total,
  SUM(amount) OVER (
    ORDER BY date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7_day_sum
FROM daily_revenue;
```

## Moving Average
- difficulty: medium
- description: Calculate rolling average over N rows

```sql
SELECT
  date,
  value,
  ROUND(
    AVG(value) OVER (
      ORDER BY date
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    )::numeric,
    2
  ) AS moving_avg_7,
  ROUND(
    AVG(value) OVER (
      ORDER BY date
      ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    )::numeric,
    2
  ) AS moving_avg_30
FROM metrics;
```

## Percent of Total
- difficulty: medium
- description: Calculate each row's percentage of group total

```sql
SELECT
  category,
  product_name,
  revenue,
  SUM(revenue) OVER (PARTITION BY category) AS category_total,
  ROUND(
    100.0 * revenue / SUM(revenue) OVER (PARTITION BY category),
    2
  ) AS pct_of_category,
  ROUND(
    100.0 * revenue / SUM(revenue) OVER (),
    2
  ) AS pct_of_total
FROM product_sales;
```

## Cumulative Distribution
- difficulty: hard
- description: Calculate percentile and cumulative distribution

```sql
SELECT
  name,
  score,
  PERCENT_RANK() OVER (ORDER BY score) AS percentile,
  CUME_DIST() OVER (ORDER BY score) AS cumulative_dist,
  ROUND(100 * PERCENT_RANK() OVER (ORDER BY score), 1) AS percentile_pct
FROM exam_results;
```

## Window Frame Specification
- difficulty: hard
- description: Custom window frame with ROWS/RANGE/GROUPS

```sql
SELECT
  date,
  amount,
  -- Last 3 rows including current
  SUM(amount) OVER (
    ORDER BY date
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS last_3_sum,
  -- All rows with same or lower value
  COUNT(*) OVER (
    ORDER BY amount
    RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS rank_by_amount,
  -- Current row and all following
  AVG(amount) OVER (
    ORDER BY date
    ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
  ) AS avg_remaining
FROM transactions;
```

## JSONB Select Fields
- difficulty: medium
- description: Extract fields from JSONB column

```sql
SELECT
  id,
  data->>'name' AS name,
  data->>'email' AS email,
  (data->>'age')::int AS age,
  data->'address'->>'city' AS city,
  data#>>'{address,zip}' AS zip_code
FROM users_json;
```

## JSONB Where Conditions
- difficulty: medium
- description: Filter by JSONB field values

```sql
SELECT * FROM products_json
WHERE
  data->>'status' = 'active'
  AND (data->>'price')::numeric > 100
  AND data->'tags' ? 'featured'
  AND data @> '{"category": "electronics"}';
```

## JSONB Contains and Exists
- difficulty: medium
- description: Check JSONB containment and key existence

```sql
SELECT * FROM documents
WHERE
  -- Contains this structure
  metadata @> '{"type": "invoice", "status": "paid"}'
  -- Has this key
  AND metadata ? 'customer_id'
  -- Has any of these keys
  AND metadata ?| ARRAY['email', 'phone']
  -- Has all of these keys
  AND metadata ?& ARRAY['amount', 'date'];
```

## JSONB Array Operations
- difficulty: medium
- description: Query and manipulate JSONB arrays

```sql
SELECT
  id,
  name,
  tags,
  jsonb_array_length(tags) AS tag_count,
  tags->0 AS first_tag,
  tags->>-1 AS last_tag
FROM products
WHERE
  jsonb_array_length(tags) > 0
  AND tags @> '["sale"]'::jsonb;
```

## JSONB Aggregation
- difficulty: medium
- description: Build JSONB from query results

```sql
SELECT
  u.id,
  u.name,
  JSONB_BUILD_OBJECT(
    'user_id', u.id,
    'name', u.name,
    'stats', JSONB_BUILD_OBJECT(
      'orders', COUNT(o.id),
      'total_spent', COALESCE(SUM(o.total_amount), 0)
    ),
    'recent_orders', COALESCE(
      JSONB_AGG(
        JSONB_BUILD_OBJECT('id', o.id, 'amount', o.total_amount)
        ORDER BY o.created_at DESC
      ) FILTER (WHERE o.id IS NOT NULL),
      '[]'::jsonb
    )
  ) AS user_data
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

## JSONB Update Operations
- difficulty: medium
- description: Modify JSONB data in place

```sql
UPDATE products
SET data = data
  || '{"updated": true}'::jsonb
  || jsonb_build_object('modified_at', NOW())
WHERE id = 123;

UPDATE users_json
SET profile = jsonb_set(
  profile,
  '{address,city}',
  '"New York"'::jsonb
)
WHERE id = 456;
```

## JSONB Path Queries (PostgreSQL 12+)
- difficulty: hard
- description: Use SQL/JSON path language for complex queries

```sql
SELECT
  id,
  data,
  jsonb_path_query(data, '$.items[*].price') AS all_prices,
  jsonb_path_query_first(data, '$.items[0].name') AS first_item,
  jsonb_path_exists(data, '$.items[*] ? (@.price > 100)') AS has_expensive
FROM orders_json
WHERE jsonb_path_exists(
  data,
  '$.items[*] ? (@.quantity > 5 && @.price < 50)'
);
```

## Array Column Operations
- difficulty: medium
- description: Work with PostgreSQL array columns

```sql
SELECT
  id,
  name,
  tags,
  ARRAY_LENGTH(tags, 1) AS tag_count,
  tags[1] AS first_tag,
  tags[ARRAY_LENGTH(tags, 1)] AS last_tag,
  'featured' = ANY(tags) AS is_featured
FROM products
WHERE
  tags && ARRAY['sale', 'new']  -- overlaps (has any)
  AND tags @> ARRAY['active']   -- contains all
  AND NOT tags && ARRAY['discontinued'];
```

## Array Aggregation and Unnest
- difficulty: medium
- description: Convert between arrays and rows

```sql
-- Unnest array to rows
SELECT
  p.id,
  p.name,
  unnest(p.tags) AS tag
FROM products p;

-- Aggregate rows to array
SELECT
  category_id,
  ARRAY_AGG(name ORDER BY name) AS product_names,
  ARRAY_AGG(DISTINCT tag) AS all_tags
FROM products, unnest(tags) AS tag
GROUP BY category_id;
```

## Full Text Search Basic
- difficulty: medium
- description: Simple full-text search with to_tsvector and to_tsquery

```sql
SELECT
  id,
  title,
  ts_rank(
    to_tsvector('english', title || ' ' || body),
    to_tsquery('english', 'database & performance')
  ) AS rank
FROM articles
WHERE
  to_tsvector('english', title || ' ' || body)
  @@ to_tsquery('english', 'database & performance')
ORDER BY rank DESC;
```

## Full Text Search with Index
- difficulty: hard
- description: Efficient full-text search using stored tsvector and GIN index

```sql
-- Create column and index (run once)
ALTER TABLE articles ADD COLUMN search_vector tsvector;

UPDATE articles SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(summary, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(body, '')), 'C');

CREATE INDEX articles_search_idx ON articles USING GIN(search_vector);

-- Query using the index
SELECT id, title, ts_rank(search_vector, query) AS rank
FROM articles, to_tsquery('english', 'postgres:* & optim:*') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

## Transaction Basic
- difficulty: medium
- description: Group statements into atomic transaction

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

INSERT INTO transfers (from_account, to_account, amount, created_at)
VALUES (1, 2, 100, NOW());

COMMIT;
```

## Transaction with Savepoint
- difficulty: medium
- description: Partial rollback using savepoints

```sql
BEGIN;

INSERT INTO orders (user_id, total_amount) VALUES (1, 100);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id, quantity)
VALUES (currval('orders_id_seq'), 999, 1);
-- If this fails, rollback to savepoint
ROLLBACK TO SAVEPOINT order_created;

-- Continue with valid items
INSERT INTO order_items (order_id, product_id, quantity)
VALUES (currval('orders_id_seq'), 1, 2);

COMMIT;
```

## Transaction Isolation Levels
- difficulty: hard
- description: Set isolation level for transaction

```sql
-- Read Committed (default) - sees committed changes from other transactions
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT * FROM accounts WHERE id = 1;
-- ... other transaction commits changes ...
SELECT * FROM accounts WHERE id = 1; -- may see different data
COMMIT;

-- Repeatable Read - consistent snapshot for entire transaction
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT SUM(balance) FROM accounts;
-- ... other transaction commits changes ...
SELECT SUM(balance) FROM accounts; -- same result as first query
COMMIT;

-- Serializable - full isolation, transactions appear sequential
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- Complex business logic here
COMMIT;
```

## SELECT FOR UPDATE
- difficulty: medium
- description: Lock rows for update to prevent concurrent modifications

```sql
BEGIN;

SELECT * FROM inventory
WHERE product_id = 123
FOR UPDATE;

-- Now these rows are locked until COMMIT/ROLLBACK
UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 123
  AND quantity > 0;

COMMIT;
```

## Advisory Locks
- difficulty: hard
- description: Application-level locks for custom synchronization

```sql
-- Session-level lock (released on disconnect)
SELECT pg_advisory_lock(12345);
-- Do exclusive work...
SELECT pg_advisory_unlock(12345);

-- Transaction-level lock (released on commit/rollback)
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('process_order_' || order_id));
-- Process order exclusively...
COMMIT; -- lock automatically released

-- Try lock (non-blocking)
SELECT CASE
  WHEN pg_try_advisory_lock(12345)
  THEN 'acquired'
  ELSE 'busy'
END AS lock_status;
```

## Create Index
- difficulty: medium
- description: Create indexes for query optimization

```sql
-- B-tree index (default, good for equality and range)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Composite index (order matters for queries)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index (smaller, faster for specific queries)
CREATE INDEX idx_active_products ON products(category_id)
WHERE status = 'active';

-- Unique index
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));

-- Concurrent index creation (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_large_table ON large_table(column);
```

## Index Types
- difficulty: hard
- description: Different index types for specific use cases

```sql
-- GIN index for arrays and JSONB
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_data_jsonb ON documents USING GIN(data jsonb_path_ops);

-- GiST index for geometric and full-text search
CREATE INDEX idx_locations_point ON locations USING GIST(coordinates);
CREATE INDEX idx_articles_fts ON articles USING GIN(search_vector);

-- BRIN index for large sorted tables (very small, less precise)
CREATE INDEX idx_logs_created ON logs USING BRIN(created_at);

-- Hash index (equality only, faster than B-tree for some cases)
CREATE INDEX idx_sessions_token ON sessions USING HASH(token);
```

## Explain Analyze
- difficulty: medium
- description: Analyze query execution plan and actual performance

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '1 year'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;
```

## Date and Time Functions
- difficulty: easy
- description: Common date/time operations

```sql
SELECT
  NOW() AS current_timestamp,
  CURRENT_DATE AS today,
  CURRENT_TIME AS current_time,
  NOW() + INTERVAL '7 days' AS next_week,
  NOW() - INTERVAL '1 month' AS last_month,
  DATE_TRUNC('month', NOW()) AS month_start,
  DATE_TRUNC('week', NOW()) AS week_start,
  EXTRACT(YEAR FROM NOW()) AS year,
  EXTRACT(DOW FROM NOW()) AS day_of_week,
  AGE(NOW(), '1990-01-01'::date) AS age;
```

## Date Formatting and Parsing
- difficulty: medium
- description: Convert between dates and strings

```sql
SELECT
  TO_CHAR(NOW(), 'YYYY-MM-DD') AS iso_date,
  TO_CHAR(NOW(), 'DD Mon YYYY HH24:MI:SS') AS formatted,
  TO_CHAR(NOW(), 'Day, Month DD, YYYY') AS long_format,
  TO_DATE('2024-03-15', 'YYYY-MM-DD') AS parsed_date,
  TO_TIMESTAMP('2024-03-15 14:30:00', 'YYYY-MM-DD HH24:MI:SS') AS parsed_ts;
```

## Generate Series
- difficulty: medium
- description: Generate sequences of numbers, dates, or timestamps

```sql
-- Number sequence
SELECT generate_series(1, 10) AS num;

-- Date sequence
SELECT generate_series(
  '2024-01-01'::date,
  '2024-12-31'::date,
  '1 month'::interval
)::date AS month_start;

-- Fill in missing dates with zeros
SELECT
  d.date,
  COALESCE(s.count, 0) AS count
FROM generate_series(
  CURRENT_DATE - 30,
  CURRENT_DATE,
  '1 day'
) AS d(date)
LEFT JOIN daily_stats s ON d.date = s.date
ORDER BY d.date;
```

## Case Expression
- difficulty: easy
- description: Conditional logic in SQL queries

```sql
SELECT
  name,
  price,
  CASE
    WHEN price < 10 THEN 'Budget'
    WHEN price < 50 THEN 'Standard'
    WHEN price < 100 THEN 'Premium'
    ELSE 'Luxury'
  END AS price_tier,
  CASE status
    WHEN 'A' THEN 'Active'
    WHEN 'I' THEN 'Inactive'
    WHEN 'P' THEN 'Pending'
    ELSE 'Unknown'
  END AS status_label
FROM products;
```

## Coalesce and Nullif
- difficulty: easy
- description: Handle NULL values with fallbacks

```sql
SELECT
  COALESCE(nickname, first_name, 'Anonymous') AS display_name,
  COALESCE(phone, email, 'No contact') AS contact,
  NULLIF(status, 'unknown') AS clean_status,
  NULLIF(quantity, 0) AS non_zero_qty,
  price / NULLIF(quantity, 0) AS unit_price -- avoid division by zero
FROM users;
```

## String Functions
- difficulty: easy
- description: Common string manipulation functions

```sql
SELECT
  UPPER(name) AS upper_name,
  LOWER(email) AS lower_email,
  INITCAP(title) AS title_case,
  LENGTH(description) AS desc_length,
  TRIM(BOTH ' ' FROM input) AS trimmed,
  LEFT(text, 100) AS first_100,
  RIGHT(text, 50) AS last_50,
  SUBSTRING(code FROM 1 FOR 3) AS prefix,
  REPLACE(text, 'old', 'new') AS replaced,
  CONCAT(first_name, ' ', last_name) AS full_name,
  first_name || ' ' || last_name AS full_name_alt;
```

## Regular Expressions
- difficulty: medium
- description: Pattern matching and extraction with regex

```sql
SELECT
  -- Match check
  'test@email.com' ~ '^[a-z]+@[a-z]+\.[a-z]+$' AS valid_email,

  -- Case insensitive match
  'HELLO' ~* 'hello' AS case_insensitive,

  -- Extract matched part
  SUBSTRING('Price: $99.99' FROM '\$([0-9.]+)') AS price,

  -- Replace with regex
  REGEXP_REPLACE('Phone: 123-456-7890', '[^0-9]', '', 'g') AS digits_only,

  -- Split to array
  REGEXP_SPLIT_TO_ARRAY('a,b;c|d', '[,;|]') AS parts,

  -- Split to rows
  REGEXP_SPLIT_TO_TABLE('one two three', '\s+') AS word;
```

## Union and Set Operations
- difficulty: easy
- description: Combine results from multiple queries

```sql
-- UNION (removes duplicates)
SELECT name, 'customer' AS type FROM customers
UNION
SELECT name, 'supplier' AS type FROM suppliers;

-- UNION ALL (keeps duplicates, faster)
SELECT id, amount, 'credit' AS type FROM credits
UNION ALL
SELECT id, amount, 'debit' AS type FROM debits;

-- INTERSECT (rows in both)
SELECT user_id FROM buyers
INTERSECT
SELECT user_id FROM sellers;

-- EXCEPT (rows in first but not second)
SELECT email FROM all_users
EXCEPT
SELECT email FROM unsubscribed;
```

## Create Materialized View
- difficulty: medium
- description: Pre-computed query results stored on disk

```sql
CREATE MATERIALIZED VIEW mv_category_stats AS
SELECT
  c.id AS category_id,
  c.name AS category_name,
  COUNT(p.id) AS product_count,
  AVG(p.price) AS avg_price,
  SUM(p.stock_quantity) AS total_stock
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
WITH DATA;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX ON mv_category_stats(category_id);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_stats;
```

## Create Function
- difficulty: hard
- description: Define reusable SQL or PL/pgSQL functions

```sql
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  subtotal NUMERIC;
  tax_rate NUMERIC := 0.08;
  total NUMERIC;
BEGIN
  SELECT SUM(quantity * unit_price)
  INTO subtotal
  FROM order_items
  WHERE order_id = order_id_param;

  IF subtotal IS NULL THEN
    RETURN 0;
  END IF;

  total := subtotal * (1 + tax_rate);
  RETURN ROUND(total, 2);
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT calculate_order_total(123);
```

## Create Trigger
- difficulty: hard
- description: Automatically execute function on table events

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_at)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW
EXECUTE FUNCTION audit_changes();
```

## Pivot Table with Crosstab
- difficulty: hard
- description: Transform rows to columns (requires tablefunc extension)

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS tablefunc;

-- Pivot monthly sales by product
SELECT * FROM crosstab(
  $$
  SELECT
    product_name,
    TO_CHAR(sale_date, 'Mon') AS month,
    SUM(amount)::text
  FROM sales
  WHERE sale_date >= '2024-01-01' AND sale_date < '2025-01-01'
  GROUP BY product_name, TO_CHAR(sale_date, 'Mon'), EXTRACT(MONTH FROM sale_date)
  ORDER BY product_name, EXTRACT(MONTH FROM sale_date)
  $$,
  $$ SELECT unnest(ARRAY['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']) $$
) AS pivot(
  product TEXT,
  jan NUMERIC, feb NUMERIC, mar NUMERIC, apr NUMERIC,
  may NUMERIC, jun NUMERIC, jul NUMERIC, aug NUMERIC,
  sep NUMERIC, oct NUMERIC, nov NUMERIC, dec NUMERIC
);
```
