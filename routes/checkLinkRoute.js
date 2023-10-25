const express = require("express");
const router = express.Router();
const {
    checkLink
} = require("../controllers/checkLinks");


router.post("/", checkLink);

module.exports = router;
