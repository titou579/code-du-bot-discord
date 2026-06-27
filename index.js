const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const keepAlive = require('./server.js');

// Lance le serveur web Express pour Railway/Render
keepAlive();

console.log("🔍 [DIAGNOSTIC] Vérification de la présence du Token...");
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ [DIAGNOSTIC] Erreur : Le DISCORD_TOKEN est introuvable !");
} else {
    console.log("✅ [DIAGNOSTIC] Le Token a bien été détecté.");
}

// Configuration du Bot Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// IDs réels de tes salons mis à jour
const CHANNELS = {
    WELCOME: '1519746058656153680',      // Ton salon #bienvenue
    TICKET: '1519760609854623965',       // Ton salon #ticket
    RULES: '1519707925944205404',        // Ton salon #regles
    SURPRISE: '1520409880983371816',     // Ton salon #jeu-surprise
    CREATOR_VOICE: '1519782037215776952' // Salon vocal de création
};

const tempChannels = new Map();

client.once('ready', () => {
    console.log(`🤖 Bot connecté avec succès en tant que ${client.user.tag}!`);
});

// --- 1: BIENVENUE AUTOMATIQUE ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(CHANNELS.WELCOME);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle(`🎉 Bienvenue chez Les fans de Brawl Stars !`)
        .setDescription(`Salut ${member}, ravi de te compter parmi nous ! Passe lire le règlement dans <#${CHANNELS.RULES}> et va t'amuser dans le salon <#${CHANNELS.SURPRISE}> ! 🎮`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    channel.send({ embeds: [welcomeEmbed] });
});

// --- 2: SALONS VOCAUX AUTOMATIQUES ---
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.channelId === CHANNELS.CREATOR_VOICE) {
        const user = newState.member;
        const category = newState.channel.parent;

        const customChannel = await newState.guild.channels.create({
            name: `🔊┃Vocal de ${user.displayName}`,
            type: ChannelType.GuildVoice,
            parent: category || null,
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                }
            ]
        });

        await newState.setChannel(customChannel);
        tempChannels.set(customChannel.id, customChannel.id);
    }

    if (oldState.channelId && tempChannels.has(oldState.channelId)) {
        const voiceChannel = oldState.guild.channels.cache.get(oldState.channelId);
        if (voiceChannel && voiceChannel.members.size === 0) {
            await voiceChannel.delete().catch(() => {});
            tempChannels.delete(oldState.channelId);
        }
    }
});

// --- 3: COMMANDES DE SETUP (TICKETS & RÈGLES) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup-ticket' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await message.delete().catch(() => {});
        
        const ticketEmbed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('🎫 BESOIN D\'AIDE OU UN PROBLÈME ?')
            .setDescription('Clique sur le bouton ci-dessous pour ouvrir un ticket privé avec le staff.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('Ouvrir un ticket').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );

        message.channel.send({ embeds: [ticketEmbed], components: [row] });
    }

    if (message.content === '!regles' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await message.delete().catch(() => {});

        const rulesEmbed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('📜 RÈGLEMENT DU SERVEUR')
            .setDescription('Bienvenue ! Pour que le serveur reste agréable, merci de suivre ces règles :')
            .addFields(
                { name: '1. Respect total', value: 'Les insultes ou propos toxiques sont bannis.' },
                { name: '2. Thématique Gaming', value: 'Restons concentrés sur l\'univers de Brawl Stars et du jeu vidéo.' },
                { name: '3. Pas de Spam', value: 'Pas de floods, ni de mentions inutiles.' }
            )
            .setFooter({ text: 'L\'équipe de modération' });

        message.channel.send({ embeds: [rulesEmbed] });
    }

    if (message.content === '!setup-surprise' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await message.delete().catch(() => {});
        
        const surpriseEmbed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('🌵 MINI-JEU SIMULATEUR SURVIVANT DUO')
            .setDescription('Lance un combat rapide en mode Survivant Duo aux côtés de ton chef de serveur ! Serez-vous capables de décrocher le Top 1 ?');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('start_survivant').setLabel('Lancer la game (Duo)').setStyle(ButtonStyle.Success).setEmoji('🚀')
        );

        message.channel.send({ embeds: [surpriseEmbed], components: [row] });
    }
});

// --- 4: INTERACTIONS (BOUTONS TICKETS & JEU) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        await interaction.deferReply({ ephemeral: true });
        
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Fermer le ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ 
            content: `Bonjour ${interaction.user}, un membre du staff va t'aider. Explique ton problème ici.`,
            components: [closeRow] 
        });

        await interaction.editReply({ content: `Ton ticket a été créé ici : ${ticketChannel}` });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: 'Fermeture et suppression du ticket dans 5 secondes...' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    if (interaction.customId === 'start_survivant') {
        await interaction.deferReply();
        
        const enemies = ['Un Edgar Toxique 👎', 'Une Melodie Sauvage 🎤', 'Un Spike Sournois 🌵', 'Un Mortis fonceur 🦇', 'Un Kit embusqué 🐱'];
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        const steps = [
            `🎮 **Survivant Duo lancé !** \`${interaction.user.username}\` fait équipe avec le chef \`titou1375902\` ! Spawns activés.`,
            `🟩 Vous ramassez 3 boîtes d'énergie ! Votre puissance augmente. Ennemis restants : 4 équipes.`,
            `⚠️ Alerte ! **${randomEnemy}** vous agresse au milieu des buissons !`,
            Math.random() > 0.35 
                ? `🔥 **TOP 1 !** \`titou1375902\` enchaîne un doublé au gadget et vous sécurisez le Survivant ! (+9 TR) 🏆` 
                : `💔 Aïe ! Le poison de la zone vous a bloqué. \`titou1375902\` meurt en tentant un move héroïque. Top 2 ! (+7 TR)`
        ];

        let msg = await interaction.editReply({ content: steps[0] });
        for(let i = 1; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 2500));
            await msg.edit({ content: steps[i] });
        }
    }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ Le login a échoué :", err.message);
});
