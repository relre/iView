const express = require('express');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    
    const response = await axios.post('http://localhost:5000/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;