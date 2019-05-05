const express = require("express");
const multer = require("multer");
const oxcert = require("./oxcert-nft/ox-nft");

const upload = multer({ dest: __dirname + "/uploads/images" });

const app = express();
const artcryptionRouter = express.Router();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());
// API endpoints
app.use("/art", artcryptionRouter);

artcryptionRouter.route("/test").get((req, res) => {
  console.log(req);
  res.send("This is artcryption blockchain.");
});

artcryptionRouter.route("/upload").post(upload.single("photo"), (req, res) => {
  if (req.file) {
    res.json(req.file);
  } else {
    throw new Error("error");
  }
});

artcryptionRouter.route("/details").post(async (req, res) => {
  if (req.body) {
    res.json(req.body);
    await oxcert.setProvider();
    const ledgerAddress = await oxcert.deployeNewLedger();
    const balance = await oxcert.getUserBalance(ledgerAddress);
    if (balance > 0) {
      oxcert.deployArtAsset(JSON.parse(req.body), ledgerAddress);
    }
  } else {
    throw new Error("error");
  }
});

// app.post("/upload", upload.single("photo"), (req, res) => {
//   if (req.file) {
//     res.json(req.file);
//   } else throw "error";
// });

app.listen(PORT, () => {
  console.log("Listening at " + PORT);
});
