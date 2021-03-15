const Discord = require('discord.js');
const config = require('../config.json');

const EMOJI_LIST = config.reactions_menu;

let match = {};

module.exports = {
	name: 'section-list',
	description: 'Choose the section sound',
	
    async execute(client, connection, page) {
        let channel = client.channels.cache.get(config.channel);
        let length = client.resources.array().length;
        let pagesNum = Math.floor(length / config.maxPage) + 1; 

        if(page < 0) return this.execute(client, connection, 0);
        else if(page >= pagesNum) return this.execute(client, connection, pagesNum-1);
        

        let embed = new Discord.MessageEmbed()
        .setTitle("Sound list    page: " + (page+1) + "/" + pagesNum)
        .setColor('#fd7066');

        let i = 0;
        client.resources.forEach( (list, directory) => {
            if(i < (page+1) * config.maxPage && i >= page * config.maxPage){
                embed.addField(EMOJI_LIST[i % config.maxPage] + " " + directory, "---", inline=true);
                match[EMOJI_LIST[i % config.maxPage]] = directory;
            }
            i++;    
        });
        
        embed.addField("⬅️➡️", "to go to the prev or next page");
        embed.addField("❌", " to leave the voice channel");

		channel.send(embed).then(async messageSent => {
            try{ 

                await messageSent.react("❌");
                if(page == 0 && pagesNum > 1) await messageSent.react('➡️');
                else if(page != 0 && page == pagesNum - 1) await messageSent.react('⬅️');
                else if(page != 0 && page != pagesNum - 1) await messageSent.react('⬅️').then( async () => { await messageSent.react('➡️') });

                let cond = config.maxPage;
                if(page+1 == pagesNum) cond = length % config.maxPage; 
                
                for(let i = 0; i < cond; i++){
                    messageSent.react(EMOJI_LIST[i]);
                }
               
            }catch(error){
                console.log("#REACTION-error: " + error);
            }

            const collector = messageSent.createReactionCollector((reaction, user) => user.id != messageSent.author.id);
            collector.on('collect', async (reaction, user) => {

                switch(reaction._emoji.name){
                    case '❌':{
                        await connection.disconnect();
                        await messageSent.delete().catch(error => {
                            console.log("#DELETE-error: " + error);
                        }).then(() => {
                            console.log("--> JOIN interface");
                            client.interfaces.get('join').execute(client);
                        });
                        break;
                    }

                    case '➡️':{
                        await messageSent.delete().catch(error => {
                            console.log("#DELETE-error: " + error);
                        }).then(() => {
                            console.log("--> NEXT page");
                            client.interfaces.get('section-list').execute(client, connection, page + 1);
                        });
                        break;
                    }

                    case '⬅️':{
                        await messageSent.delete().catch(error => {
                            console.log("#DELETE-error: " + error);
                        }).then(() => {
                            console.log("--> NEXT page");
                            client.interfaces.get('section-list').execute(client, connection, page - 1);
                        });
                        break;
                    }

                    default: {
                        try{
                            await messageSent.delete()
                                .then(() => {
                                    console.log("--> PLAY interface " + match[reaction._emoji.name]);
                                    client.interfaces.get('play').execute(client, connection, match[reaction._emoji.name], 0, page);
                                })
                        }catch(error){
                            console.log(error);
                        }
                        break;
                    }
                }
            });
        });
	},
};