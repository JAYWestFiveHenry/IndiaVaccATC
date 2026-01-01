const fetch = require('node-fetch');
const {  Client, Intents, MessageActionRow, MessageButton,MessageEmbed } = require('discord.js');
const { ActivityType } = require('discord-api-types/v10');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const API_URL = "https://data.vatsim.net/v3/vatsim-data.json";
const statusAPI = "https://network-status.vatsim.net/summary.json";
const TARGET_CHANNEL_ID = ''; //Channel ID

// Store the online state of the controllers
let controllersOnline = {};
let previousStatusData = null;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  checkControllers();
  setInterval(checkControllers, 10000); // Check every 10 seconds, adjust to your needs
  setInterval(checkStatus, 10000);
  client.user.setActivity({name:"Sri Lanka and Maldives Airspace" ,type: ActivityType.Watching,status: 'online' }) 
});

client.on('messageCreate', async message => {
  if (message.channel.id !== TARGET_CHANNEL_ID) return; // Only for your channel
  if (message.author.bot) return; // Ignore bots

  // Check: message must have ONLY image attachments
  if (message.attachments.size > 0) {
      const isAllImages = message.attachments.every(attachment =>
          attachment.contentType?.startsWith('image')
      );

      if (isAllImages) {
          try {
              await message.react('👍');
          } catch (error) {
              console.error('Failed to react to image:', error);
          }
      }
  }
});
async function checkStatus() {
  try {
    const response = await fetch(statusAPI);
    const data = await response.json();

    // Compare current data with previous data
    if (!previousStatusData || JSON.stringify(data) !== JSON.stringify(previousStatusData)) {
      


      const embed = new MessageEmbed()
        .setColor("#3498db")

        //.setTitle(`Page Status: ${data.page.status}`)
        .setDescription("**Incident Reports**")
        .addFields(
          //{ name: "Page Name", value: data.page.name },
          
          { name: "Active Incidents", value: data.activeIncidents.length.toString() },
          //{ name: "URL", value: data.page.url },

          
        );

      // Add active incidents as fields
       const incidentFields = data.activeIncidents.map((incident) => ({
         name: `Incident: ${incident.name}`,
         value: `ID: ${incident.id}\nStatus: ${incident.status}\nImpact: ${incident.impact}\nStarted: ${new Date(incident.started).toUTCString()}\n[More Info](${incident.url})`
       }));
       embed.addFields(incidentFields);

      // Replace "YOUR_STATUS_CHANNEL_ID" with your desired channel ID
      client.channels.cache.get("1025710467840229417").send({ embeds: [embed] });

      // Update previousStatusData
      previousStatusData = data;
    }
  } catch (error) {
    console.error("Error fetching status:", error);
  }
}

async function checkControllers() {
  const response = await fetch(API_URL);
  const data = await response.json();

  const newControllersOnline = {};
  const positionNames = {
            "VCCF_CTR$": "Colombo ACC",
            "VCCF_T_CTR$": "Colombo ACC (Trainee)",
            "VCCF_I_CTR$": "Colombo ACC (Instructor)",
            "VCCF_X_CTR$": "Colombo ACC (Examiner)",
            "VCCF_M_CTR$": "Colombo ACC (Mentor)",
            "VRMF_CTR$": "Male ACC",
            "VRMF_I_CTR$": "Male ACC (Instructor)",
            "VRMF_X_CTR$": "Male ACC (Examiner)",
            "VRMF_T_CTR$": "Male ACC (Trainee)",
            "VRMF_M_CTR$": "Male ACC (Mentor)",
            "VRMF_S_CTR$": "Male South ACC",
            "VCBI_APP$" : "Colombo Director",
            "VCBI_T_APP" : "Colombo Director (Trainee)",
            "VCBI_I_APP" : "Colombo Director (Instructor)",
            "VCBI_X_APP" : "Colombo Director (Examiner)",
            "VCBI_M_APP$" : "Colombo Director (Mentor)",
            "VCRI_APP$" : "Mattlala Approach",
            "VCCA_APP$" : "Anuradhapura Approach",
            "VRMM_APP$" : "Male Approach",
            "VRMM_T_APP": "Male Approach (Trainee)",
            "VRMM_I_APP" : "Male Approach (Instructor)",
            "VRMM_X_APP" : "Male Approach (Examiner)",
            "VRMM_M_APP$" : "Male Approach (Mentor)",
            "VCBI_TWR$" : "Colombo Tower",
            "VCBI_T_TWR" : "Colombo Tower (Trainee)",
            "VCBI_I_TWR$" : "Colombo Tower (Instructor)",
            "VCBI_X_TWR$" : "Colombo Tower (Examiner)",
            "VCBI_M_TWR$" : "Colombo Tower (Mentor)",
            "VCBI_GND$" : "Colombo Ground",
            "VCBI_I_GND$" : "Colombo Ground (Instructor)",
            "VCBI_M_GND$" : "Colombo Ground (Mentor)",
            "VCRI_TWR$" : "Mattala Tower",
            "VCRI_GND$" : "Mattala Ground",
            "VCCA_TWR$" : "Anuradhapura Tower",
            "VCCC_TWR$" : "Ratmalana Tower",
            "VCCK_TWR$" : "Koggala Tower",
            "VCCB_TWR$" : "Batticoloa Tower",
            "VCCG_TWR$" : "Gai Tower",
            "VCCT_TWR$" : "China-Bay Tower",
            "VCCH_TWR$" : "Mineriya Tower",
            "VCCJ_TWR$" : "Jaffna Tower (Procedural)",
            "VCCS_TWR$" : "Sigiriya Tower",
            "VCCW_TWR$" : "Wirawila Tower",
            "VCCN_TWR$" : "Katukurunda Tower",
            "VRMM_TWR$" : "Male Tower",
            "VRMM_T_TWR" : "Male Tower (Trainee)",
            "VRMM_I_TWR$" : "Male Tower (Instructor)",
            "VRMM_X_TWR$" : "Male Tower (Examiner)",
            "VRMM_M_TWR$" : "Male Tower (Mentor)",
            "VRMM_GND$" : "Male Ground",
            "VRMM_I_GND$" : "Male Ground (Instructor)",
            "VRMM_M_GND$" : "Male Ground (Mentor)",
            "VRMG_TWR$" : "Gan Control",
            "VRMO_TWR$" : "Koodoo Tower",
            "VREI_I_TWR": "Ifuru Infomation",
            "VRGD_I_TWR": "Madivaru Infomation",
            "VRMU_I_TWR": "Dhaalu Infomation",
            "VRNT_I_TWR": "Thiramafushi Infomation",
            "VRDA_TWR": "Maafaru Tower"
    // Add more mappings as needed
  };
  const ratings = {
    "-1": { short: "INA", long: "Inactive" },
    "0": { short: "SUS", long: "Suspended" },
    "1": { short: "OBS", long: "Pilot/Observer" },
    "2": { short: "S1", long: "Tower Trainee" },
    "3": { short: "S2", long: "Tower Controller" },
    "4": { short: "S3", long: "Terminal Controller" },
    "5": { short: "C1", long: "Enroute Controller" },
    "6": { short: "C2", long: "Senior Controller" },
    "7": { short: "C3", long: "Senior Controller" },
    "8": { short: "I1", long: "Instructor" },
    "9": { short: "I2", long: "Senior Instructor" },
    "10": { short: "I3", long: "Senior Instructor" },
    "11": { short: "SUP", long: "Supervisor" },
    "12": { short: "ADM", long: "Administrator" },
  };

  for (const controller of data.controllers) {
    if (controller.callsign.startsWith('VC') || 
    controller.callsign.startsWith('VR') || 
    controller.callsign.startsWith('VCCF' )|| controller.callsign.startsWith('VRMF') )
 { // Specific airport code, replace 'VO/VA/VE/VI' with your desired code
      newControllersOnline[controller.callsign] = true;
      if (!controllersOnline[controller.callsign]) {
        // This controller just came online
        const positionName = positionNames[controller.callsign] || controller.callsign;
        const controllerRating = ratings[controller.rating];


        const embed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle(`${positionName} (${controller.callsign}) is online!`)
          //.setDescription('This controller just came online!.')
          .addFields(
            { name: "Controller Name",
                  value: `**[${controller.name}](https://stats.vatsim.net/stats/${controller.cid}) (${controller.cid})**`,
                  inline: true },
            { name: 'Rating', value: `${controllerRating.short} - ${controllerRating.long}` },

            // {name: 'CID', value: `${controller.cid} is online!`},

          )
          .setTimestamp()
          .setFooter({ text: 'SRMvACC', iconURL: 'https://4r-ipm.me/vaccsrm/assets/images/srm-305x172.png' });

         const button = new MessageButton()
            .setStyle('LINK') // Can be PRIMARY, SECONDARY, SUCCESS, DANGER, or LINK
            .setLabel('Feedback')
            .setURL(`https://hq.vatwa.net/atc/feedback?cid=${controller.cid}`);
          const row = new MessageActionRow().addComponents(button);
        client.channels.cache
          .get("YOUR_CHANNEL_ID") //Channel ID
          .send({ embeds: [embed],components: [row] });
        client.channels.cache.get('YOUR_CHANNEL_ID').send({ embeds: [embed] }); // replace with your channel id
      }
    }
  }

  for (const controllerCallsign in controllersOnline) {
    
    if (!newControllersOnline[controllerCallsign]) {
      // This controller just went offline
      //const positionName = positionNames[controller.callsign] || controller.callsign;
      const positionName = positionNames[controllerCallsign] || controllerCallsign;
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle(` ${positionName} ${controllerCallsign} is offline.`)
        //.setDescription('This controller just went offline.')
        .setTimestamp()
        .setFooter({ text: 'SRMvACC', iconURL: 'https://4r-ipm.me/vaccsrm/assets/images/srm-305x172.png' });
       const button = new MessageButton()
            .setStyle('LINK') // Can be PRIMARY, SECONDARY, SUCCESS, DANGER, or LINK
            .setLabel('Feedback')
            .setURL(`https://hq.vatwa.net/atc/feedback?cid=${controller.cid}`);
          const row = new MessageActionRow().addComponents(button);
        client.channels.cache
          .get("YOUR_CHANNEL_ID")
          .send({ embeds: [embed],components: [row] });
      client.channels.cache.get('YOUR_CHANNEL_ID').send({ embeds: [embed] }); // replace with your channel id
    }
  }

  controllersOnline = newControllersOnline;
}

client.login('YOUR_BOT_TOKEN,'); // replace with your bot token
