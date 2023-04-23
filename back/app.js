const express = require('express');
const mongoose = require('mongoose');
const Sauce = require('./schema/sauces');
const SauceL = require('./schema/sauceL');
const { error } = require('console');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// connection + test Mongo DB
mongoose.connect('mongodb+srv://axelp6:GnZGVdaduEUael5k@axelp6.i4j3ykz.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());


//header pour passer d'un server à l'autre
//Cross Origin Resource Sharing mais ici on autorise tout
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // PATCH, OPTIONS enlevé car pas présent dans le tableau
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

//----------------------------------------------------Sauces lecture
// je commence par le squelette du get route:/api/sauces mais avec les bonnes routes
app.get('/api/sauces', (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}))
});

//----------------------------------------------------Sauces création
app.post('/api/sauces', (req, res, next) => {
  // Récupérer les données de la sauce depuis req.body
  const sauceData = req.body;

  // Créer un nouveau document Sauce avec les données récupérées
  const newSauce = new Sauce(sauceData);

  // Enregistrer le document Sauce dans la base de données
  newSauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
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
// ici je rajoute la route du login api/auth/login
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
            'RANDOM_SECRET_KEY', // Vous devriez utiliser une clé secrète plus sécurisée pour la production
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



module.exports = app;