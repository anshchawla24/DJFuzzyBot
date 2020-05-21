const {
    Client,
    MessageEmbed,
} = require('discord.js');
const express = require('express'); // requiring discord API
const bot = new Client();
const messageEmbedFuzzy = new MessageEmbed();
const messageEmbedRoe = new MessageEmbed();

const ytdl = require('ytdl-core');
const token = process.env.TOKEN;
const PREFIX = '$';
const app = express();

const port = process.env.PORT || 5000;
app.get('/',(req, res) => {
    res.send("Fuzzy says hello!"); //hello
});

app.listen(port);




bot.once('ready', () => {
    console.log('Bot is working!');//bot is working
});

//Using a map instead of an array to seperate bot commands over different servers
const queue = new Map();

bot.on('message', message => {
    const serverQueue = queue.get(message.guild.id);
    let args = message.content.substring(PREFIX.length).split(" ");
    switch (args[0]) {
        case 'play':
            start(message, serverQueue, args);
            break;

        case 'skip':
            skip(message, serverQueue);
            break;

        case 'stop':
            stop(message, serverQueue);
            break;

        case 'creators':
            creators(message);
    }
});


async function start(message, serverQueue, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send("You must be in a voice channel to use this command");
    if (!args[1] || !args[1].match(
            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
        )) {
        return message.channel.send("Please provide a valid youtube URL");
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url
    };

    //Making a json object for the queue to keep track of channels and connections
    if (!serverQueue) {
        const queueObject = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
        };
        queue.set(message.guild.id, queueObject);
        queueObject.songs.push(song);
        var connection = await voiceChannel.join();
        queueObject.connection = connection;
        play(message.guild, queueObject.songs[0]);

    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`Yooooo ${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to have that kinda music skipping powers."
        );
    if (!serverQueue)
        return message.channel.send("No Songs to skip, Byeeeeeeeeee!! ");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "Lmao, No. Join a vc nibba!"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
    serverQueue.textChannel.send(`Now playing: **${song.title}**`);
}

function creators(message) {
    messageEmbedFuzzy
        .setColor('#0099ff')
        .setTitle('Fuzzy')
        .setURL('https://github.com/anshchawla24')
        .setThumbnail('https://avatars1.githubusercontent.com/u/41838153?s=460&u=a2d64df1901e71b0189343ec7c996dbb822afedf&v=4')
    messageEmbedRoe
        .setColor('#0099ff')
        .setTitle('Roe')
        .setURL('https://github.com/roeintheglasses')
        .setThumbnail('https://avatars2.githubusercontent.com/u/24797615?s=460&u=3d1b0823a9c99a1ed01089f251045c0dc9596d18&v=4')
    message.channel.send(messageEmbedRoe);
    message.channel.send(messageEmbedFuzzy);

}

bot.login(token);
