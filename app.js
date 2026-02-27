const express = require('express');
const { engine } = require('express-handlebars');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.send("Error processing form.");
    }

    const fullName = fields.fullName?.[0];
    const email = fields.email?.[0];
    const course = fields.course?.[0];

    const file = files.profilePic?.[0];

    if (!file) {
      return res.send("No file uploaded.");
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.headers['content-type'])) {
      return res.send("Only JPG and PNG images are allowed.");
    }

    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFileName = Date.now() + "_" + file.originalFilename;
    const newPath = path.join(uploadDir, newFileName);

    fs.copyFile(file.path, newPath, (err) => {
        if (err) {
            console.error(err);
            return res.send("Error saving file.");
        }

        fs.unlink(file.path, () => {});

        res.render('profile', {
            fullName,
            email,
            course,
            imagePath: `/uploads/${newFileName}`
        });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});