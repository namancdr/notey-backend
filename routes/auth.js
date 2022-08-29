const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { findOne, emit } = require('../models/User');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = process.env.JWT_SECRET

// Route 1 : Create a user POST: /api/auth/createuser no login required
 router.post('/createuser',
    body('name', 'Enter a valid name!').isLength({ min: 2 }),
    body('email', 'Enter a valid email!').isEmail(),
    body('password', 'Password should be atlest 4 character long!').isLength({ min: 4 }),
    async (req, res) => {
     
    let success = false 


    // check for validation error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success,  errors: errors.array() });
    }
    try {
      
    
    // check weather the user with the same email exists already!
    let user = await User.findOne({email: req.body.email})
    if(user) {
      return res.status(400).json({success, error: "Sorry! a user with this email already exist!"})
    }

    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(req.body.password, salt)
    
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
    })
  
    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET)
    success = true
    // res.json(user)
    res.json({success, authToken})

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error!")
    }

    })

// Route 2 : Authenticate a user POST: /api/auth/login no login required
router.post('/login',
    body('email', 'Enter a valid email!').isEmail(),
    body('password', 'Password cannot be blank!').exists(),
    async  (req, res) => {
      
      let success = false

    // check for validation error
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()})
      } 

      const {email, password} = req.body
      try {
        let user = await User.findOne({email})
        if(!user){
          return res.status(400).json({success, error: "User with this email does not exist!"})
        }

        const comparePassword = await bcrypt.compare(password, user.password)

        if(!comparePassword){
          return res.status(400).json({success, error: "Incorrect password!"})
        }

        const data = {
          user: {
            id: user.id
          }
        }
        
        success= true
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({success, authToken})

      } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error!")
      }

    }
)

// Route 3 : Get logged in user details using POST: /api/auth/getuser : - Login required
router.post('/getuser', fetchuser,  async  (req, res) => {
  try {
    userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message)   
    res.status(500).send("Internal Server Error!")
  }

    }
)

 module.exports = router