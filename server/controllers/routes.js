 
const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/', function (req, res) {
    res.send({ "welcome": "It's running" });
});

module.exports = router;