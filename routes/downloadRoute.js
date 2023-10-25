const express = require("express");
const router = express.Router();
const {
    downloadMp3
} = require("../controllers/download");


router.post("/", downloadMp3);

module.exports = router;
