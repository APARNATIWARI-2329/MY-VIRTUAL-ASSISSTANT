import multer from 'multer';

// Use memory storage — no file paths are constructed from user input at all
// Files are held in memory as Buffer and uploaded directly to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

export default upload;
