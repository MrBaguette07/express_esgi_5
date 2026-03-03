const Sequelize = require('sequelize');
require('dotenv').config();

const bdd = new Sequelize(process.env.DB_NAME,
                          process.env.DB_USER,
                          process.env.DB_PASSWORD,
                          {
                            dialect: "mysql",
                            host: process.env.DB_HOST,
                            port: process.env.DB_PORT
                          }
);

const connect = async () => {
    try{
        await bdd.authenticate();
        console.log("Connected to the database");
    }catch(e){
        console.error("Unable to connect to the database " + e.message);
    }
}

module.exports = {connect, bdd};