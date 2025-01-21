const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const helmet = require('helmet'); // ✅ Security
const cors = require('cors'); // ✅ CORS

const User = require('./models/User'); // Import User model

dotenv.config();
if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    console.error("Missing environment variables! Ensure MONGO_URI and SESSION_SECRET are set.");
    process.exit(1);
}

const app = express();

// ✅ Security Middleware
app.use(helmet());  // Helps secure Express apps
app.use(cors());    // Allows cross-origin requests

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(error => console.error('❌ MongoDB Connection Error:', error));

// ✅ Rate Limiting - Move Before Routes!
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter); // ✅ Applied before defining routes

app.use(express.json());

// ✅ Passport.js Configuration
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false, 
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Strategy Setup
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Import Routes
const indexRouter = require('./routes/index');
const companyRoutes = require('./routes/companyRoutes');
const userRoutes = require('./routes/userRoutes');

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.use('/api', indexRouter);
app.use('/api', companyRoutes);
app.use('/api', userRoutes);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
