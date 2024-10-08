const express = require('express');
const router = express.Router();
const { isAdmin, getUserDetails, createModerator, deleteModerator } = require('../controllers/adminController');


router.get('/moderators', isAdmin, getUserDetails);
router.post('/moderators', isAdmin, createModerator);
router.delete('/moderators/:id', isAdmin, deleteModerator);

module.exports = router;
