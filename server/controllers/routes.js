 
const express = require('express');
const router = express.Router({mergeParams: true});
const gSheetController = require("./gSheetController");

router.use('/gSheet', gSheetController);

router.get('/', function (req, res) {
    res.send({ "welcome": "It's running" });
});

module.exports = router;