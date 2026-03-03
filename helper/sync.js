const {bdd} = require('./connexion.js');
const associate = require('./associate.js');

const sync = async () => {
    await associate();
    await bdd.sync({alter: true});
}

sync();