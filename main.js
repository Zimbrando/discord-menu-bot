const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const emojiUnicode = require("emoji-unicode")

const client = new Discord.Client();

client.interfaces = new Discord.Collection();
client.resources = new Discord.Collection();

const interfacesFiles = fs.readdirSync('./interfaces').filter(file => file.endsWith('.js'));
const resourcesFiles = fs.readdirSync('./resources');

for (const file of interfacesFiles){
	const interface = require(`./interfaces/${file}`);
    client.interfaces.set(interface.name, interface);
}

for (const directory of resourcesFiles){
    const fileslist = fs.readdirSync('./resources/' + directory);   
    client.resources.set(directory, fileslist);
}

client.on('ready', () => {
    console.log("BOT started -> JOIN interface");
    client.interfaces.get('join').execute(client);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});         

client.login(config.token);
