const express = require('express');
const mongoose = require('mongoose');
const Sauce = require('./schema/sauces');
const SauceL = require('./schema/sauceL');
const { error } = require('console');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
const multer = require('multer');
const GridFsStorage = require('multer-storage-gridfs');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

// const storage = multer.memoryStorage(); // Supprimez cette ligne
// const upload = multer({ storage: storage }); // Supprimez cette ligne également

const app = express();

// connection + test Mongo DB
mongoose.connect('mongodb+srv://axelp6:GnZGVdaduEUael5k@axelp6.i4j3ykz.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//config gridfs
const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// config Multer pour utiliser GridFS
const storage = new GridFsStorage({
  url: 'your_mongo_connection_string',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: Date.now() + '-' + file.originalname,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

app.use(express.json());


//header pour passer d'un server à l'autre----------------------------------------------
//Cross Origin Resource Sharing mais ici on autorise tout
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // PATCH, OPTIONS enlevé car pas présent dans le tableau
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});


//---------------------------------------signup-------------------------
// ici je rajoute la route du sign up api/auth/signup
// il me manque le hash pour l'instant
app.post('/api/auth/signup', (req, res, next) => {
  // Hacher le mot de passe avec bcrypt
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => {
      // Créer un nouveau document utilisateur avec l'email et le mot de passe haché
      const user = new SauceL({
        email: req.body.email,
        password: hashedPassword,
      });

      // Enregistrer l'utilisateur dans la base de données
      user.save()
        .then(() => res.status(201).json({ message: 'compte créé' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
});
//------------------------------------------login------------------------------
// 
app.post('/api/auth/login', (req, res, next) => {
  SauceL.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          const token = jwt.sign(
            { userId: user._id },
            secret, //clé secrète aléatoire
            { expiresIn: '24h' } // Le token expirera après 24 heures
          );
          res.status(200).json({
            userId: user._id,
            token: token
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
});

//----------------------------------------------------Sauces lecture
// je commence par le squelette du get route:/api/sauces mais avec les bonnes routes
app.get('/api/sauces', (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}))
});

/*---------check token
app.use((req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secret);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'ID utilisateur KO';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Requéte invalide')
    });
  }
});

*/

//----------------------------------------------------Sauces création
app.post('/api/sauces', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune image fournie' });
  }

  const sauceData = JSON.parse(req.body.sauce);
  const imageUrl = req.protocol + '://' + req.get('host') + '/images/' + req.file.filename;

  const newSauce = new Sauce({
    name: sauceData.name,
    manufacturer: sauceData.manufacturer,
    description: sauceData.description,
    mainPepper: sauceData.mainPepper,
    heat: sauceData.heat,
    userId: sauceData.userId,
    imageUrl: imageUrl
  });

  newSauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch(() => res.status(400).json({ message: 'Sauce non enregistrée !' }));
});

// récupérer les images.
app.get('/images/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'Aucun fichier existe' });
    }

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: 'Ce n\'est pas une image' });
    }
  });
});

module.exports = app;