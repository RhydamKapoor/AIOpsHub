// Load environment variables first
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const toolsRoutes = require('./routes/tools');
const chatRoutes = require('./routes/chat');
const workflowRoutes = require('./routes/getWorkflow');
const connectDB = require('./config/db');

// Load passport config
require('./config/passport');

const app = express();


const allowedOrigins = [process.env.CLIENT_DEV, process.env.CLIENT_PROD];
// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed'));
        }
      },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Initialize passport
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', toolsRoutes);
app.use('/api', chatRoutes);
app.use('/api', workflowRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {    
    // For development, send detailed error
    if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json({ 
            message: 'Something went wrong!',
            error: err.message,
            stack: err.stack
        });
    }
    
    // For production, just a generic message
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 