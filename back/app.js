const express = require('express');
const mongoose = require('mongoose');
const Sauce = require('./schema/sauces');
const SauceL = require('./schema/sauceL');
const { error } = require('console');

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

//----------------------------------------------------Sauces
// je commence par le squelette du get route:/api/sauces mais avec les bonnes routes
app.get('/api/sauces', (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}))
});


//---------------------------------------signup-------------------------
// ici je rajoute la route du sign up api/auth/signup
// il me manque le hash pour l'instant
app.post('/api/auth/signup', (req, res, next) => {
  const user = new SauceL({
    email: req.body.email,
    password: req.body.password, // a hasher
  });

  user.save()
    .then(() => res.status(201).json({message: 'compte créé'}))
    .catch(error => {
      console.error('Erreur lors de la création du compte:', error);
      res.status(400).json({error});
    });
});
//------------------------------------------login------------------------------
// ici je rajoute la route du login api/auth/login
// il me manque le token pour l'instant
app.post('/api/auth/login', (req, res, next) => {
  // Recherche de l'utilisateur avec l'email
  SauceL.findOne({ email: req.body.email })
    .then(user => {
      // Si l'utilisateur n'existe pas, envoie un message d'erreur
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }

      // Compare le mot de passe envoyé avec le mot de passe stocké dans la base de données
      // mots de passe en texte brut, mais il faudra utiliser bcrypt 
      if (req.body.password !== user.password) {
        return res.status(401).json({ error: 'Mot de passe incorrect !' });
      }

      //  message de succès
      res.status(200).json({ message: 'Succès !' });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});


module.exports = app;