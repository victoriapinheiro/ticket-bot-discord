require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Comando /ticket com motivo obrigatório
const commands = [
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Cria um ticket de suporte')
    .addStringOption(option =>
      option.setName('motivo')
        .setDescription('Descreva o motivo do ticket')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 🔧 Garante que o canal de logs existe
async function garantirCanalDeLogs(guild) {
  const nome = 'logs-ticket';
  let canal = guild.channels.cache.find(c => c.name === nome);
  if (!canal) {
    canal = await guild.channels.create({
      name: nome,
      type: 0,
      topic: 'Canal de logs dos tickets',
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: client.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        }
      ]
    });
    console.log(`✅ Canal de logs criado: ${canal.name}`);
  }
  return canal;
}

// 📥 Cria o ticket com botão
async function criarTicket(interaction) {
  const motivo = interaction.options.getString('motivo');
  const guild = interaction.guild;

  const canal = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: 0,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
      },
      {
        id: client.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
      }
    ]
  });

  // Salva o motivo no canal para uso posterior
  canal.topic = motivo;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('fechar_ticket')
      .setLabel('Fechar Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await canal.send({
    content: `🎫 Ticket criado por <@${interaction.user.id}>.\nMotivo: ${motivo}`,
    components: [row]
  });

  await interaction.reply({ content: `✅ Ticket criado: ${canal}`, ephemeral: true });
}

// 🗑️ Fecha o ticket e envia log com motivo
async function fecharTicket(interaction) {
  const canal = interaction.channel;
  const guild = interaction.guild;

  if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    return interaction.reply({ content: '❌ Não tenho permissão para fechar o ticket.', ephemeral: true });
  }

  await interaction.reply({ content: '✅ Ticket será fechado em 5 segundos...', ephemeral: true });

  const logChannel = await garantirCanalDeLogs(guild);
  const motivo = canal.topic || 'Motivo não especificado';

  await logChannel.send(`📁 Ticket fechado: ${canal.name}\n👤 Autor: <@${interaction.user.id}>\n📝 Motivo: ${motivo}`);

  setTimeout(async () => {
    await canal.delete().catch(err => console.error('Erro ao deletar canal:', err));
  }, 5000);
}

// 🚀 Inicialização
client.once('ready', async () => {
  console.log(`Bot online como ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  await garantirCanalDeLogs(guild);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Slash command registrado com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar slash command:', error);
  }
});

// 🎯 Interações
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'ticket') {
    await criarTicket(interaction);
  }

  if (interaction.isButton() && interaction.customId === 'fechar_ticket') {
    await fecharTicket(interaction);
  }
});

client.login(process.env.TOKEN);