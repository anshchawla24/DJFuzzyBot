const {
    Client,
    Attachment
} = require('discord.js'); // requiring discord API
const bot = new Client();
const ytdl = require('ytdl-core');
const token = require('./config/token');


const PREFIX = '!';

bot.on('ready', () => {

    console.log("Bot is working!");

})
var servers = {};

bot.on('message', message => {

    let args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0]) {

        case 'play':

            function play(connection, message) {

                var server = servers[message.guild.id];
                server.dispatcher = connection.play(ytdl(server.queue[0], {
                    filter: "audioonly"
                }));

                server.queue.shift();
                server.dispatcher.on("end", function() {
                    if (server.queue[0]) {
                        play(connection, message);
                    } else {
                        connection.disconnect();
                    }
                });
            }
            if (!args[1] || !args[1].match(
                    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
                )) {
                message.channel.send("Please provide a valid youtube URL");
                return;
            }
            if (!message.member.voice.channel) {
                message.channel.send("You must be in a voice channel to use this command");
                return;
            }
            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }
            var server = servers[message.guild.id];
            server.queue.push(args[1]);
            if (!message.guild.voiceConnection) message.member.voice.channel.join().then((connection) => {
                play(connection, message);
            }).catch(error => {
                console.log(error);
            })
            break;
    }
});
bot.login(token);