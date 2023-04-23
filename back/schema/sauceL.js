// Importation du package mongoose pour MongoDB
const mongoose = require('mongoose');

// Importation du package bcrypt pour le hachage des mots de passe
const bcrypt = require('bcrypt');

// Création d'un schéma pour les utilisateurs, appelé sauceLSchema
const sauceLSchema = mongoose.Schema({
  // Le champ email est une chaîne de caractères, obligatoire, unique et indexé
  email: { type: String, required: true, unique: true, index: true },

  // Le champ password est une chaîne de caractères et obligatoire
  password: { type: String, required: true },
});

// Exportation du modèle SauceL basé sur le schéma sauceLSchema
// Le modèle sera utilisé pour interagir avec la collection 'sauceL' dans MongoDB
module.exports = mongoose.model('SauceL', sauceLSchema);
