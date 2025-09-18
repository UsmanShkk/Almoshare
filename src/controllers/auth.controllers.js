// const User = require('@models/User');
// const jwt = require('jsonwebtoken');
// const config = require('@config');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');

// const generateToken = (user) => {
//     return jwt.sign(
//       { 
//         id: user._id,
//         email: user.email
//       }, 
//       config.jwtSecret, 
//       {
//         expiresIn: config.jwtExpiresIn
//       }
//     );
// };

// const loginUser = async (req, res) => {
//   try {
//     const { email, username, password } = req.body;

//     // Validate input - password is required, either email or username (not both)
//     if (!password || password.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         message: 'Password is required'
//       });
//     }

//     if ((!email && !username) || (email && username)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Provide either email or username, not both'
//       });
//     }

//     // Build query - find user by email or username (only one is provided)
//     const query = email ? { email } : { username };
//     const user = await User.findOne(query).select('+password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }



//     // Verify password using the model method
//     const isPasswordValid = await user.comparePassword(password);
    
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Generate token
//     const token = generateToken(user);

//     // Update last login (optional)
//     await user.save();

//     // Send response
//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: {
//           id: user._id,
//           fullName: user.fullName,
//           email: user.email,
//           username: user.username,
//           role: user.role,
//           status: user.status
//         },
//         token: token,
//         expiresIn: config.jwtExpiresIn
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// const registerUser = async (req, res) => {
//   try {
//     const { fullName, email, username, password, referralCode } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email }, { username }] 
//     });
    
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: existingUser.email === email ? 'Email already exists' : 'Username already taken'
//       });
//     }

//     // Create new user
//     const userData = {
//       fullName,
//       email,
//       username,
//       password
//     };

//     if (referralCode) {
//       userData.referralCode = referralCode;
//     }

//     const user = await User.create(userData);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         username: user.username
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);

//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email or username already exists'
//       });
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0]
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };
// const loginWithGoogle = async (req, res) => {
//   try {
//     const { googleId, email, fullName } = req.body;

//     // Validate required Google data
//     if (!googleId || !email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Google ID and email are required'
//       });
//     }

//     // Check if user exists by googleId or email
//     let user = await User.findOne({
//       $or: [
//         { googleId: googleId },
//         { email: email }
//       ]
//     });

//     if (user) {
//       // User exists - update googleId if not set
//       if (!user.googleId) {
//         user.googleId = googleId;
//         await user.save();
//       }
//     } else {
//       // User doesn't exist - create new user
//       const userData = {
//         fullName: fullName || 'Google User',
//         email: email,
//         username: email.split('@')[0] + '_' + Date.now(), // Generate unique username
//         googleId: googleId,
//         password: crypto.randomBytes(32).toString('hex') // Generate random password for Google users
//       };

//       user = await User.create(userData);
//     }

//     // Generate token
//     const token = generateToken(user);

//     // Update last login
//     user.lastLogin = new Date();
//     await user.save();

//     // Send response
//     res.status(200).json({
//       success: true,
//       message: 'Google login successful',
//       data: {
//         user: {
//           id: user._id,
//           fullName: user.fullName,
//           email: user.email,
//           username: user.username
//         },
//         token: token,
//         expiresIn: config.jwtExpiresIn
//       }
//     });

//   } catch (error) {
//     console.error('Google login error:', error);

//     // Handle duplicate key error (in case of race condition)
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already exists with different login method'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// module.exports = { registerUser, loginUser, loginWithGoogle };

const User = require('@models/User');
const jwt = require('jsonwebtoken');
const config = require('@config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const admin = require('@config/firebase.config');

const generateToken = (user) => {
    return jwt.sign(
      { 
        id: user._id,
        email: user.email
      }, 
      config.jwtSecret, 
      {
        expiresIn: config.jwtExpiresIn
      }
    );
};

const getContext = async (req, res) => {
  try {
    req.user = { id: req.body.id }; //only for testing 
    // Get complete user data (password is excluded by default due to select: false)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate new token
    const token = generateToken(user);

    // Return user context
    return res.json({
      status: 'success',
      data: {
        user: user.toAuthJSON(),
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input - password is required, either email or username (not both)
    if (!password || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if ((!email && !username) || (email && username)) {
      return res.status(400).json({
        success: false,
        message: 'Provide either email or username, not both'
      });
    }

    // Build query - find user by email or username (only one is provided)
    const query = email ? { email } : { username };
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password using the model method
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Update last login (optional)
    await user.save();

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toAuthJSON(),
        token: token,
        expiresIn: config.jwtExpiresIn
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { fullName, email, username, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already exists' : 'Username already taken'
      });
    }

    // Create new user
    const userData = {
      fullName,
      email,
      username,
      password
    };

    if (referralCode) {
      userData.referralCode = referralCode;
    }

    const user = await User.create(userData);

    // Generate token after successful registration
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toAuthJSON(),
        token: token,
        expiresIn: config.jwtExpiresIn
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const { email, firstName, lastName, profilePhoto, token } = req.body;

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken || decodedToken.email !== email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email,
        fullName: `${firstName || ''} ${lastName || ''}`.trim() || 'Google User',
        username: email.split('@')[0] + '_' + Date.now(), // Generate unique username
        photo: profilePhoto,
        password: crypto.randomBytes(16).toString('hex') // Random password for Google users
      });
      await user.save();

    } else {
      // Update existing user's profile if needed
      user.fullName = `${firstName || ''} ${lastName || ''}`.trim() || user.fullName;
      user.photo = profilePhoto || user.photo;
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    // Return user data and token
    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: user.toAuthJSON(),
        token: jwtToken,
        expiresIn: config.jwtExpiresIn
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { registerUser, loginUser, loginWithGoogle, getContext };