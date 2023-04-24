// Importation du package mongoose pour MongoDB
const mongoose = require('mongoose');


const saucesSchema = mongoose.Schema({
  // Le champ name est une chaîne de caractères et obligatoire
  name: { type: String, required: true },

  // Le champ manufacturer est une chaîne de caractères
  manufacturer: { type: String },

  // Le champ description est une chaîne de caractères et obligatoire
  description: { type: String, required: true },

  // Le champ mainPepper est une chaîne de caractères
  mainPepper: { type: String },

  // Le champ imageUrl est une chaîne de caractères
  imageUrl: { type: String },

  // Le champ heat est un nombre
  heat: { type: Number },

  // Le champ likes est un nombre
  likes: { type: Number },

  // Le champ dislikes est un nombre
  dislikes: { type: Number },

  // Le champ usersLiked est un tableau de chaînes de caractères
  usersLiked: { type: [String] },

  // Le champ usersDisliked est un tableau de chaînes de caractères
  usersDisliked: { type: [String] },
});

// Exportation du modèle Sauce basé sur le schéma saucesSchema
// Le modèle sera utilisé pour interagir avec la collection 'Sauce' dans MongoDB
module.exports = mongoose.model('Sauce', saucesSchema);
