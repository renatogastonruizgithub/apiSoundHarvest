const express = require("express");
const router = express.Router();
const download = require("./downloadRoute")
const checkLink = require("./checkLinkRoute")
const search = require("./searchRoute")

router.use("/download", download);

router.use("/checkLink", checkLink);
router.use("/search", search);


module.exports = router;
