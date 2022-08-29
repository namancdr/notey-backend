const express = require('express')
const router = express.Router()
const Note = require('../models/Note')
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');


// Route 1 : Get all the notes GET: /api/notes/fetchallnotes : - Login required

 router.get('/fetchallnotes', fetchuser, async (req, res) => {
   const notes = await Note.find({user: req.user.id})
   res.json(notes)
 })

// Route 2 : Add a new note POST: /api/notes/addnote : - Login required
router.post('/addnote', fetchuser, [
   body('title', 'Title cannot be empty!').isLength({ min: 1 }),
   body('description', 'Description cannot be empty').isLength({ min: 1 })
], async(req, res) => {

   try {
      
   
   const {title, description, tag} = req.body

   const errors = validationResult(req);  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Note({
      title, description, tag, user: req.user.id
    })
    
    const savedNotes = await note.save()

    res.json(savedNotes)
   } catch (error) {
      console.error(error.message)
      res.status(500).send("Internal Server Error!")
   }
}
) 

// Route 3 : Update an existing note PUT /api/notes/updatenote : - Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

   try {
      
   
   const {title, description, tag} = req.body

   // create a new note object
   const newNote = {}

   if(title){newNote.title = title}
   if(description){newNote.description = description}
   if(tag){newNote.tag = tag}

   // Find the note to be updated and update it
   let note = await Note.findById(req.params.id)

   if(!note){
      return res.status(404).send("Not Found")
   }

   // Verify if the user owns the note
   if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not allowed")
   }

   note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
   res.json(note)
} catch (error) {
   console.error(error.message)
   res.status(500).send("Internal Server Error!")
}
})

// Route 4 : Delete an existing note DELETE /api/notes/deletenote : - Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
   try{
   // check if the note exists
   let note = await Note.findById(req.params.id)
   if(!note){
      return res.status(404).send('Not Found!')
   }

   // verify if the user owns the note
   if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not allowed!")
   }

   note = await Note.findByIdAndDelete(req.params.id)
   res.json({"Success": "The note has been deleted!", note: note})
} catch (error) {
   console.error(error.message)
   res.status(500).send("Internal Server Error!")
}
})


 module.exports = router