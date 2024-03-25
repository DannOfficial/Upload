/**
 * DannTeam
 * Instagram: @dannalwaysalone
 * WhatsApp: +62 831-3755-0315
*/

const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const memoryStore = require('memorystore')(session);

// App
const app = express();
const PORT = process.env.PORT || 3000;

// Multer
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const filename = `${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

// Session
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 2000, 
  message: 'Oops too many requests'
});

app.use(session({
  secret: 'DannTeam',  
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new memoryStore({
    checkPeriod: 86400000
  }),
}));

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        const { filename, mimetype, size } = req.file;
        const ext = mimetype.split('/')[1];
        const url = `/uploads/${filename}`;

        return res.status(200).json({
            success: true,
            url,
            name: filename,
            mimeType: mimetype,
            ext,
            size
        });
    }

    return res.status(400).json({
        success: false,
        error: 'No file uploaded.'
    });
});

app.get("/uploads/:filename", (req, res) => {
    const { filename } = req.params;

    res.sendFile(__dirname + "/uploads/" + filename);
});

// Listening
app.listen(PORT, () => {
  console.log(`Server is running listening on port ${PORT}`)
})