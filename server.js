// 1. Import Exprerss
import express from 'express';
import swagger from 'swagger-ui-express';
import cors from 'cors';

import productRouter from './src/features/product/product.routes.js';
import userRouter from './src/features/user/user.routes.js';
import jwtAuth from './src/middlewares/jwt.middleware.js';
import cartRouter from './src/features/cartItems/cartItems.routes.js';
import apiDocs from './swagger.json' assert {type: 'json'};
import loggerMiddleware from './src/middlewares/logger.middleware.js';
import { ApplicationError } from './src/error-handler/applicationError.js';
// 2. Create Server
const server = express();

// CORS policy configuration
const allowedOrigins = [
  "http://localhost:5500",
  "https://e-commerce-apis-fx3w.onrender.com"
];
server.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed from this origin"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// server.use((req, res, next)=>{
//   res.header('Access-Control-Allow-Origin','http://localhost:5500');
//   res.header('Access-Control-Allow-Headers','*');
//   res.header('Access-Control-Allow-Methods','*');
//   // return ok for preflight request.
//   if(req.method=="OPTIONS"){
//     return res.sendStatus(200);
//   }
//   next();
// })

server.use(express.json());
// Bearer <token>
// for all requests related to product, redirect to product routes.
// localhost:3200/api/products
server.use("/api-docs", 
swagger.serve, 
swagger.setup(apiDocs)
);

server.use(loggerMiddleware);

server.use(
  '/api/products',
  jwtAuth,
  productRouter
);
server.use('/api/products', jwtAuth, productRouter);
server.use('/api/cartItems', jwtAuth, cartRouter);
server.use('/api/users', userRouter);

// 3. Default request handler
server.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ecommerce Website</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #6dd5fa, #2980b9);
          font-family: Arial, sans-serif;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        h1 {
          color: #2c3e50;
          font-size: 2rem;
          margin-bottom: 10px;
        }
        p {
          color: #34495e;
          font-size: 1.2rem;
          margin-bottom: 20px;
        }
        a {
          display: inline-block;
          text-decoration: none;
          background: #2980b9;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 1rem;
          transition: 0.3s;
        }
        a:hover {
          background: #1f6391;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Ecommerce Website</h1>
        <p>Developed by <strong>Sachin Singh</strong></p>
        <a href="https://e-commerce-apis-fx3w.onrender.com/api-docs/" target="_blank">
          Click here to see the API List
        </a>
      </div>
    </body>
    </html>
  `);
});



// Error handler middleware
server.use((err, req, res, next)=>{
  console.log(err);
  if (err instanceof ApplicationError){
    res.status(err.code).send(err.message);
  }

  // server errors.
  res
  .status(500)
  .send(
    'Something went wrong, please try later'
    );
});

// 4. Middleware to handle 404 requests.
server.use((req, res)=>{
  res.status(404).send("API not found. Please check our documentation for more information at localhost:3200/api-docs")
});


// 5. Specify port.
server.listen(3200);

console.log('Server is running at 3200');
