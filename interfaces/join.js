const Discord = require('discord.js');
const config = require('../config.json');

const REACTION = {
    "join" : '✅',
    "help" : '🔆'
}

module.exports = {
	name: 'join',
	description: 'First interface',

	execute(client) {
        let channel = client.channels.cache.get(config.channel);

        let embed = new Discord.MessageEmbed()
        .setTitle("Welcome to the bot")
        .setColor('#fd7066')
        .addField("press " + REACTION.join, " to join your voice channel ")
        .addField("press " + REACTION.help, " to see the info page ");


		channel.send(embed).then(messageSent => {
            
            messageSent.react(REACTION.join);
            messageSent.react(REACTION.help);

            const collector = messageSent.createReactionCollector((reaction, user) => {
                return user.id != messageSent.author.id && (reaction._emoji.name == REACTION.join
                    || reaction._emoji.name == REACTION.help);
            });

            collector.on('collect', (reaction, user) => {
                
                switch(reaction._emoji.name){
                    case REACTION.join: {

                        messageSent.delete().catch((error) => {
                            console.log("#DELETE-error: " + error);
                        });
                        
                        const guild = client.guilds.cache.get(messageSent.guild.id);
                        const member = guild.members.cache.get(user.id);
                        
                        if (member.voice.channel) {
                            try{
                                let connection = member.voice.channel.join().then( connection =>  { 
                                    console.log("--> PLAY interface");
                                    client.interfaces.get('section-list').execute(client, connection, 0) 
                                }).catch(error=>{
                                    console.log("#JOIN-error: " + error);
                                    channel.send("I don't have the permission to join that channel!").then(newMsg => {
                                        newMsg.delete({timeout: 2000}).catch(error => {
                                            console.log("#DELETE-error: " + error);
                                        }).then(() => {
                                            return this.execute(client);
                                        });
                                    });
                                });
                            }catch(error){
                                console.log(error)
                            }
                            
                        }else{
                            channel.send("Join a voice channel first then press the button!").then(newMsg => {
                                newMsg.delete({timeout: 2000}).catch(error => {
                                    console.log("#DELETE-error: " + error);
                                }).then(() => {
                                    this.execute(client);
                                });
                            });
                        }
                        break;
                    }
                    
                    case REACTION.help: {
                        //EXAMPLE OF ANOTHER INTERFACE
                        break;
                    }
                       
                }
            });
        });
	},
};
