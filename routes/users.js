var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    site = {
        "email": "contact(at)aistl.com",
        "address": "XHU,CHENGDU",
        "title": "GameCenter",
        "second_title": "AISTLab"
    }
    res.send(site);
});
module.exports = router;
