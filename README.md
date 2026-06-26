# Student Store Starter Code

## Unit Assignment: Student Store

Submitted by: **Ava Flanigan**

### Application Features

#### CORE FEATURES

- [X] **Database Creation**: Set up a Postgres database to store information about products and orders.
  - [X]  Use Prisma to define models for `products`, `orders`, and `order_items`.
  - [X]  **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: Use Prisma Studio to demonstrate the creation of your `products`, `orders`, and `order_items` tables. 
- [X] **Products Model**
  - [X] Develop a products model to represent individual items available in the store. 
  - [X] This model should at minimum include the attributes:
    - [X] `id`
    - [X] `name`
    - [X] `description`
    - [X] `price` 
    - [X] `image_url`
    - [X] `category`
  - [X] Implement methods for CRUD operations on products.
  - [X] Ensure transaction handling such that when an product is deleted, any `order_items` that reference that product are also deleted. 
  - [X] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: Use Prisma Studio to demonstrate the creation of all attributes (table columns) in your Products Model.
- [X] **Orders Model**
  - [X] Develop a model to manage orders. 
  - [X] This model should at minimum include the attributes:
    - [X] `order_id`
    - [X] `customer_id`
    - [X] `total_price`
    - [X] `status`
    - [X] `created_at`
  - [X] Implement methods for CRUD operations on orders.
  - [X] Ensure transaction handling such that when an order is deleted, any `order_items` that reference that order are also deleted. 
  - [X] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: Use Prisma Studio to demonstrate the creation of all attributes (table columns) in your Order Model.

- [X] **Order Items Model**
  - [X] Develop a model to represent the items within an order. 
  - [X] This model should at minimum include the attributes:
    - [X] `order_item_id`
    - [X] `order_id`
    - [X] `product_id`
    - [X] `quantity`
    - [X] `price`
  - [X] Implement methods for fetching and creating order items.  
  - [X] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: Use Prisma Studio to demonstrate the creation of all attributes (table columns) in your Order Items Model.
- [X] **API Endpoints**
  - [X] Application supports the following **Product Endpoints**:
    - [X] `GET /products`: Fetch a list of all products.
    - [X] `GET /products/:id`: Fetch details of a specific product by its ID.
    - [X] `POST /products`: Add a new product to the database.
    - [X] `PUT /products/:id`: Update the details of an existing product.
    - [X] `DELETE /products/:id`: Remove a product from the database.
  - [X] Application supports the following **Order Endpoints**:
    - [X] `GET /orders`: Fetch a list of all orders.
    - [X] `GET /orders/:order_id`: Fetch details of a specific order by its ID, including the order items.
    - [X] `POST /orders`: Create a new order with specified order items.
    - [X] `PUT /orders/:order_id`: Update the details of an existing order (e.g., change status).
    - [X] `DELETE /orders/:order_id`: Remove an order from the database.
    - [X] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: Use Postman or another API testing tool to demonstrate the successful implementation of each endpoint. For the `DELETE` endpoints, please use Prisma Studio to demonstrate that any relevant order items have been deleted. 
- [X] **Frontend Integration**
  - [X] Connect the backend API to the provided frontend interface, ensuring dynamic interaction for product browsing, cart management, and order placement. Adjust the frontend as necessary to work with your API.
  - [X] Ensure the home page displays products contained in the product table.
  - [X] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: Use `npm start` to run your server and display your website in your browser. 
    - [X] Demonstrate that users can successfully add items to their shopping cart, delete items from their shopping cart, and place an order
    - [X] After placing an order use Postman or Prisma Studio demonstrate that a corresponding order has been created in your orders table.

### Stretch Features

- [X] **Added Endpoints**
  - [X] `GET /order-items`: Create an endpoint for fetching all order items in the database.
  - [X] `POST /orders/:order_id/items` Create an endpoint that adds a new order item to an existing order. 
- [X] **Past Orders Page**
  - [X] Build a page in the UI that displays the list of all past orders.
  - [X] The page lists all past orders for the user, including relevant information such as:
    - [X] Order ID
    - [X] Date
    - [X] Total cost
    - [X] Order status.
  - [X] The user should be able to click on any individual order to take them to a separate page detailing the transaction.
  - [X] The individual transaction page provides comprehensive information about the transaction, including:
    - [X] List of order items
    - [X] Order item quantities
    - [X] Individual order item costs
    - [X] Total order cost
- [X] **Filter Orders**.
  - [X] Create an input on the Past Orders page of the frontend application that allows the user to filter orders by the email of the person who placed the order. 
  - [X] Users can type in an email and click a button to filter the orders.
  - [X] Upon entering an email address and submitting the input, the list of orders is filtered to only show orders placed by the user with the provided email. 
  - [X] The user can easily navigate back to the full list of orders after filtering. 
    - [X] Proper error handling is implemented, such as displaying "no orders found" when an invalid email is provided.
- [ ] **Deployment**
  - [ ] Website is deployed using [Render](https://courses.codepath.org/snippets/site/render_deployment_guide).
  - [ ] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: To ease the grading process, please use the deployed version of your website in your walkthrough with the URL visible. 



### Walkthrough Video

`https://www.loom.com/share/ce10b3cd1bdc4fe1b3a566af101a6fa8`

### Reflection

* Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?

The topics discussed in the labs directly correlated to the assignment as they provided interactive examples on how to correlate every backend process to the next. Although the labs were helpful, understanding the process of how databases are connected to the endpoint is still hard and I had trouble correlating each function and file to each step of the process (i.e. associating GET and POST with routing).

* If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.
  
If I had more time, I would have added more frontend UI features and made the website more attractive. I also would have deployed the site to understand how to deploy databases alongside a website.

* Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?

I was able to observe the project demos that occurred, and I was impressed by the thought that went into the implementation of some of my peer's projects. Many of them incorporated in-depth frontend integrations that made the Student Store website more palatable and user-friendly. I plan to ensure my future websites are as detailed as theirs!


### Shout out

Thank you to Zainab for helping me understand more about the backend flow of data and to Danny and Devarsh for the lessons on backend!




