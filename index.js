const { Collection, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, MessageAttachment } = require("discord.js");
const { Client, Intents, Permissions } = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.once('ready', () => {
  console.log('Bot online!');
});

client.on('messageCreate', async (message) => {
  if (message.content === '!tickett') {
    const selectRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('support')
        .setLabel('supportt')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('support2')
        .setLabel('support22')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('support3')
        .setLabel('support33')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('support4')
        .setLabel('support44')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('support5')
        .setLabel('support55')
        .setStyle('PRIMARY')
    );

    const embed = new MessageEmbed()
      .setAuthor('TICKET')
      .setDescription('Hello. Select the category.')
      .setColor('#2f3136')
      .setFooter('Bot developed by VDEVHD');

    message.channel.send({ embeds: [embed], components: [selectRow] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  const userRole = interaction.guild.roles.cache.get('id'); // Replace with actual role ID
  const staffLogChannelId = 'id'; // Replace with actual channel ID

  if (interaction.customId === 'close_ticket') {
    const ticketChannel = interaction.channel;
    const ticketContent = ticketChannel.messages.cache.map((msg) => `(${msg.author.tag}) ${msg.content}`).join('\n');

    const staffLogChannel = client.channels.cache.get(staffLogChannelId);
    staffLogChannel.send({
      files: [{
        name: `ticket_transcript_${ticketChannel.name}.txt`,
        attachment: Buffer.from(ticketContent, 'utf-8'),
      }],
      content: `Ticket closed by ${interaction.user.tag}`,
    });

    ticketChannel.delete();
  } else if (interaction.customId.startsWith('support')) {
    const categoryName = interaction.customId;
    const parentCategoryId = {
      'support': 'id_category',
      'support2': 'id_category',
      'support3': 'id_category',
      'support4': 'id_category',
      'support5': 'id_category',
    }[categoryName];

    if (!parentCategoryId) {
      return interaction.reply('Selected category is not valid.', { ephemeral: true });
    }

    const channels = interaction.guild.channels.cache.find((c) => c.topic === `user id・${userId}`);
    if (channels) {
      const responseEmbed = new MessageEmbed()
        .setDescription(`⚠️ <@${userId}> You already have an open ticket.`)
        .setColor('#2f3136');

      interaction.reply({ embeds: [responseEmbed], ephemeral: true });
    } else {
      const channelName = `${categoryName}-${interaction.user.username}`.replace(/[^a-zA-Z0-9-_]/g, '');
      interaction.guild.channels.create(channelName, {
        name: channelName,
        parent: parentCategoryId,
        topic: `user id・${userId}`,
        permissionOverwrites: [
          {
            id: userId,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'ATTACH_FILES'],
          },
          {
            id: userRole.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.id,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async (channel) => {
        const ticketEmbed = new MessageEmbed()
          .setDescription(`<@${userId}> Ticket created in channel <#${channel.id}>`)
          .setColor('#2f3136');

        interaction.reply({ embeds: [ticketEmbed], ephemeral: true });

        channel.send(`<@${userId}> - <@&${userRole.id}>`);
        const embed = new MessageEmbed()
          .setAuthor(`Ticket ${interaction.guild.name}`)
          .setDescription(`<@${userId}>, Welcome to the SUPPORT ticket. Please make sure to clearly explain the reason for opening the ticket.`)
          .setColor('#2f3136')
          .setFooter('Bot developed by VDEVHD');

        const closeButton = new MessageButton()
          .setLabel('Close Ticket')
          .setStyle('SECONDARY')
          .setCustomId('close_ticket');

        const row = new MessageActionRow().addComponents(closeButton);
        channel.send({ embeds: [embed], components: [row] });
      });
    }
  }
});
