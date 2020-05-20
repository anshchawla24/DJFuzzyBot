const Discord = require('discord.js'); // requiring discord API
const bot = new Discord.Client();
const ytdl = require('ytdl-core');

const token = 'NzEyNTczNDM3NDgyMzY5MTM2.XsTh4w.GDCdMK__oGM2n8k9dXYRj3Dp0mo';
const PREFIX = '!';

bot.on('ready', () =>{

    console.log("Bot is working!");

})

var servers = {};


bot.on('message', message => {

    let args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0]){

        case 'play':

            function play(connection, message){

                var server = servers[message.guild.id];
                server.dispatcher = connection.play (ytdl(server.queue[0], {filter:"audioonly"}));

                server.queue.shift();
                server.dispatcher.on("end", function(){
                    if(server.queue[0]){
                        play(connection, message);    
                    }

                    else {
                        connection.disconnect();

                    }


                });

            }


            if(!args[1]){
                message.channel.send("Please provide a valid link");
                return;

            }

            if(!message.member.voice.channel){

                message.channel.send("You must be in a voice channel to use this command");
                return;

            }

            if(!servers[message.guild.id]) servers[message.guild.id] = {

                queue: []

            }

            var server = servers[message.guild.id];
            server.queue.push(args[1]);
            
            if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){

                play(connection, message);
            })


            break;


    }







});

bot.login(token);




