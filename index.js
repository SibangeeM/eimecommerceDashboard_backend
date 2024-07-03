const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");



const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
const PORT = process.env.PORT || 8080;
//mongodb connection
console.log(process.env.MONGODB_URL);
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to Databse"))
  .catch((err) => console.log(err));

//user schema
const userSchema = mongoose.Schema({
  
  username: String,
  email: {
    type: String,
    unique: true,
  }, 
  password: String,
});
const adminUsersModel = mongoose.model("adminUsers", userSchema);


//api
app.get("/", (req, res) => {
  res.send("Server is running");
});

//login api
app.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await adminUsersModel.findOne({ email }).exec();

  if (user) {
    // Compare passwords
      if( user.username === username && user.password === password && user.email === email ){
        const dataSend = {
          _id: user._id,
          username: user.username,
          email: user.email,
        };
        res.send({
          message: "Login is successful",
          alert: true,
          data: dataSend,
        });
      }
        // Passwords match    
      else {
        // Passwords don't match
        res.send({
          message: "Invalid email or password",
          alert: false,
        });
      }
    }
    else {
    // User not found
    res.send({
      message: "Email is not available, please sign up",
      alert: false,
    });
  }
});

//product section
const schemaProduct = mongoose.Schema({
  name: String,
  materials: String,
  materialName: String,
  image: String,
  pricePound: String,
  description: String,
});
const productModel = mongoose.model("product", schemaProduct);


//save product in data
//api

app.post("/uploadProduct", async (req, res) => {
  console.log(res)
  const data = await productModel(req.body);
  const datasave = await data.save();
  res.send({ message: "Upload successfully" });
});

app.get("/product", async (req, res) => {
  const data = await productModel.find({});
  res.send(JSON.stringify(data));
});


// orders
const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Paypal",
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
const orderModel = mongoose.model("Order", orderSchema);


app.get("/orders", async (req, res) => {
  const data = await orderModel.find({});
  res.send(JSON.stringify(data));
});


//remove product from ecommerce site as well
app.delete("/product/:productId", async (req, res) => {
  const { productId } = req.params;
  console.log("Attempting to delete product with ID:", productId);

  try {
    const product = await productModel.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    res.json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting the product",
      success: false,
      error: error.message,
    });
  }
});

// API to change the orderStatus
app.put("/updateOrderStatus", async (req, res) => {
  const { orderID, orderStatus } = req.body;

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderID,
      { orderStatus: orderStatus },
      { new: true }
    );

    if (updatedOrder) {
      res.json({
        success: true,
        message: "Order status updated successfully",
        order: updatedOrder
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating the order status",
      error: error.message
    });
  }
});

// Update product details


//server is ruuning
app.listen(PORT, () => console.log("server is running at port : " + PORT));
