var express = require('express')
var router = express.Router()

router.use("/user", require("./routes/userRoute"))
router.use("/auth", require("./routes/authRoute"))
router.use("/faq", require("./routes/faqRoute"))
router.use("/support", require("./routes/supportRoute"))
router.use("/implant", require("./routes/implantRoute"))

module.exports = router
