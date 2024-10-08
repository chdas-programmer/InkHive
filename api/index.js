import express from "express";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from "cors";
import {db} from "./db.js";



const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../front/public/upload')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  },
});


const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename)
})

app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


// db.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

app.listen(8800, () => {
  console.log("Connected!!!!");
});
