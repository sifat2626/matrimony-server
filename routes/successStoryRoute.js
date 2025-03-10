const express = require('express');
const successStoryController = require("../controllers/successStoryController");
const router = express.Router();

// Route to create or update a success story
router.post('/success-story', successStoryController.createOrUpdateSuccessStory);
// Route to get a single success story
router.get('/success-story/:id', successStoryController.getSuccessStory);

// Route to get all success stories
router.get('/success-stories', successStoryController.getAllSuccessStories);
router.get('/count/success-stories', successStoryController.getSuccessStoriesCount);

module.exports = router;