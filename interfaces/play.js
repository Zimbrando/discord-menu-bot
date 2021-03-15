const Discord = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

const EMOJI_LIST = config.reactions_menu;

let match = {};

module.exports = {
	name: 'play',
	description: 'Play the sound',
	
    async execute(client, connection, section, page, section_page) {
        let channel = client.channels.cache.get(config.channel);
        let length = client.resources.get(section).length;
        let pagesNum = Math.floor(length / config.maxPage) + 1; 

        if(page < 0) return this.execute(client, connection, section, 0, section_page);
        else if(page >= pagesNum) return this.execute(client, connection, section, pagesNum-1, section_page);
        
        let embed = new Discord.MessageEmbed()
        .setTitle(section + " sounds list    page: " + (page+1) + "/" + pagesNum)
        .setColor('#fd7066');

        let i = 0;
        client.resources.get(section).forEach( filename => {
            if(i < (page+1) * config.maxPage && i >= page * config.maxPage){
                embed.addField(EMOJI_LIST[i % config.maxPage] + " --> play " + filename, "------------", inline=true);
                match[EMOJI_LIST[i % config.maxPage]] = filename;
            }
            i++;
        });
        
        embed.addField("🔙", " to go back")
        .addField("⬅️➡️", "to go to the prev or next page")
        .addField("❌", " to leave the voice channel");
        
        channel.send(embed).then(async messageSent => {
            
            try{
                await messageSent.react("🔙");
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
                    case '🔙': {
                        try{
                            console.log("DELETE BACK");
                            await messageSent.delete().catch(error => {
                                console.log("#DELETE-error: " + error);
                            }).then(() => {
                                console.log("--> SECTION-LIST interface");
                                client.interfaces.get('section-list').execute(client, connection, section_page);
                            });
                        }catch(error){
                            console.log(error);
                        }
                        break;
                    }

                    case '➡️':{
                        await messageSent.delete().catch(error => {
                            console.log("#DELETE-error: " + error);
                        }).then(() => {
                            console.log("--> NEXT page");
                            this.execute(client, connection, section, page + 1, section_page);
                        });
                        break;
                    }

                    case '⬅️':{
                        await messageSent.delete().catch(error => {
                            console.log("#DELETE-error: " + error);
                        }).then(() => {
                            console.log("--> NEXT page");
                            this.execute(client, connection, section, page-1, section_page);
                        });
                        break;
                    }

                    case '❌': {
                        try{
                            await connection.disconnect();
                            await messageSent.delete().catch(error => {
                                console.log("#DELETE-error: " + error);
                            }).then(() => {
                                console.log("--> JOIN interface");
                                client.interfaces.get('join').execute(client);
                            });
                        }catch(error){
                            console.log(error);
                        }
                        break;
                    }

                    default: {
                        if(match[reaction._emoji.name])
                            connection.play(require("path").join(__dirname, '../resources/' + section + '/' + match[reaction._emoji.name]));
                        break;
                    }
                }
            });
        }).catch(console.error);

    }
}