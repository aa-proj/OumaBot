import {
  ActionRowBuilder,
  ButtonBuilder,
  Client,
  IntentsBitField,
  ButtonStyle,
  Message,
  TextChannel, REST, Routes
} from "discord.js";
import {validateTicketText} from "./kebaUtil";
import {getRaceDetails} from "./netkeiba";
import {type} from "os";
import {clearInterval} from "timers";

if (!process.env.DISCORD_TOKEN) throw Error("TOKEN NOT PROVIDED!!")

const commands = [
  {
    name: "umadetail",
    description: "その日の競馬情報を表示します",
    options: [
      {
        name: "date",
        required: true,
        description: "日付け(2022/10/30)",
        type: 3
      }
    ]

  }
]

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands("746325591065624739"), {body: commands});
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client(
  {
    intents:
      [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions
      ]
  });

client.on("ready", () => {
  console.log("Discord Bot Ready");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return
  const bakenResult = validateTicketText(message.content)
  if(bakenResult.length === 0) return
  await message.reply(JSON.stringify(bakenResult))
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "umadetail") {
      const option = interaction.options.get("date")?.value
      if (!option || typeof option !== "string") {
        await interaction.reply("dateが不正です")
        return
      }
      const date = option.split("/").map(d => Number(d))
      if (date.length !== 3) {
        await interaction.reply("dateが不正です")
        return
      }
      const raceDate = new Date(date[0], date[1] - 1, date[2])
      let interactionText = "取得中"
      await interaction.reply(interactionText)
      const interval = setInterval(() => {
        interactionText += "."
        interaction.editReply(interactionText)
      }, 5000)
      setTimeout(() => {
        clearInterval(interval)
      }, 25 * 1000)
      const data = await getRaceDetails(raceDate)
      if(data.length === 0) {
        clearInterval(interval)
        await interaction.editReply("ないっぽい")
        return
      }
      const raceDetail = data.map(races => {
        return `${raceDate.toLocaleDateString("ja-JP")}のレース概要\n${races.title}\n${races.raceData.map(race => {
          return `${race.raceNumber} : ${race.raceTitle} ${race.raceLong} ${race.raceHorseCount} ${race.raceStartTime}`
        }).join("\n")}
        \n`
      }).join("\n")
      try {
        clearInterval(interval)
      } finally {
        await interaction.deleteReply()
        await interaction.channel?.send(raceDetail)
      }
      return
    }

  }
  return
})


client.login(process.env.DISCORD_TOKEN);

