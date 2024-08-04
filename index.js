const { Client, GatewayIntentBits, PermissionsBitField, MessageActionRow, MessageButton, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;

// Set up intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Define the role names and allowed channel ID
const OWNER_ROLE = 'Bypasser';
const BOOSTER_ROLE = 'booster';
const BOOSTER_CHANNEL_ID = '1268183600986329088'; // Replace with the actual channel ID where boosters can use the commands

const hasRole = (member, roleName) => {
    return member.roles.cache.some(role => role.name === roleName);
};

const isOwnerOrBooster = (member) => {
    return hasRole(member, OWNER_ROLE) || hasRole(member, BOOSTER_ROLE);
};

const isOwner = (member) => {
    return hasRole(member, OWNER_ROLE);
};

const isBooster = (member) => {
    return hasRole(member, BOOSTER_ROLE);
};

const isAllowedChannel = (channel) => {
    return channel.id === BOOSTER_CHANNEL_ID;
};

// Event: Bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event: Message received
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    console.log(`Received a message from ${message.author.tag}: ${message.content}`);

    if (message.content.startsWith('!')) {
        const [command, ...args] = message.content.slice(1).split(/\s+/);

        if (command === 'ping') {
            if (!isOwnerOrBooster(message.member)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
            if (isBooster(message.member) && !isAllowedChannel(message.channel)) {
                await message.reply('You can only use this command in the designated boosters\' channel.');
                return;
            }
            console.log(`ping command invoked by ${message.author.tag}`);
            await message.reply('nigga stfu imma tryin to sleep!');  // **Consider using more appropriate language**
        } else if (command === 'userinfo') {
            if (!isOwnerOrBooster(message.member)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
            if (isBooster(message.member) && !isAllowedChannel(message.channel)) {
                await message.reply('You can only use this command in the designated boosters\' channel.');
                return;
            }

            const user = message.mentions.users.first() || message.author;
            const member = message.guild.members.cache.get(user.id);

            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s Info`)
                .setColor('#0099ff')
                .addFields(
                    { name: 'Name', value: user.username, inline: true },
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Joined', value: member.joinedAt.toDateString(), inline: true }
                )
                .setThumbnail(user.displayAvatarURL());

            await message.reply({ embeds: [embed] });
        } else if (command === 'give') {
            if (!isOwner(message.member)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                await message.reply('You don\'t have permission to manage roles.');
                return;
            }

            const role = message.mentions.roles.first();
            const user = message.mentions.users.first();
            if (role && user) {
                const member = message.guild.members.cache.get(user.id);
                await member.roles.add(role);
                await message.reply(`Role ${role.name} has been given to ${user.tag}.`);
            } else {
                await message.reply('Please mention a role and a user.');
            }
        } else if (command === 'ungive') {
            if (!isOwner(message.member)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                await message.reply('You don\'t have permission to manage roles.');
                return;
            }

            const role = message.mentions.roles.first();
            const user = message.mentions.users.first();
            if (role && user) {
                const member = message.guild.members.cache.get(user.id);
                await member.roles.remove(role);
                await message.reply(`Role ${role.name} has been removed from ${user.tag}.`);
            } else {
                await message.reply('Please mention a role and a user.');
            }
        } else if (command === 'scriptsearch') {
            if (!isOwnerOrBooster(message.member)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
            if (isBooster(message.member) && !isAllowedChannel(message.channel)) {
                await message.reply('You can only use this command in the designated boosters\' channel.');
                return;
            }

            const gameName = args.join(' ');
            const formattedGameName = encodeURIComponent(gameName);
            const freeUrl = `https://scriptblox.com/?mode=free&q=${formattedGameName}`;
            const paidUrl = `https://scriptblox.com/?mode=paid&q=${formattedGameName}`;

            const freeButton = new MessageButton()
                .setLabel('Free')
                .setStyle('LINK')
                .setURL(freeUrl);

            const paidButton = new MessageButton()
                .setLabel('Paid')
                .setStyle('LINK')
                .setURL(paidUrl);

            const row = new MessageActionRow()
                .addComponents(freeButton, paidButton);

            const embed = new EmbedBuilder()
                .setTitle(`Scripts for '${gameName}'`)
                .setDescription('Select an option to view scripts:')
                .setColor('#0099ff');

            await message.reply({ embeds: [embed], components: [row] });
        }
    }
});

// Log in to Discord
client.login(TOKEN);
