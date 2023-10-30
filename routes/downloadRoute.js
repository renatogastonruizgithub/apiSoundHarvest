const express = require("express");
const router = express.Router();
const {
    downloadMp3
    , downloadMp4
} = require("../controllers/download");


router.post("/", downloadMp3);
router.post("/mp4", downloadMp4);
module.exports = router;
