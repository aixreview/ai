import { fileURLToPath } from 'url';
import path from 'path';
import config from '../config.js';
import { cmd, commands } from '../command.js';
import { runtime } from '../lib/functions.js';
import axios from 'axios';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function for small caps text
const toSmallCaps = (text) => {
    if (!text || typeof text !== 'string') return '';
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
        'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
        's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
        'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
        'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
    };
    return text.split('').map(char => smallCapsMap[char] || char).join('');
};

// Format category — category name + commands use the SAME small-caps font
const formatCategory = (category, cmds) => {
    const validCmds = cmds.filter(cmd => cmd.pattern && cmd.pattern.trim() !== '');
    if (validCmds.length === 0) return '';

    // "main" -> "Main Menu" -> "ᴍᴀɪɴ ᴍᴇɴᴜ"
    const titleText = `${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()} Menu`;

    let title  = `\n╭──〔 *${toSmallCaps(titleText)}* 〕───⊷\n`;
    let body   = validCmds.map(cmd => `*┋  ● ${toSmallCaps(cmd.pattern)}*`).join('\n');
    let footer = `\n╰───────────────────⊷`;
    return `${title}${body}${footer}`;
};

// Function to validate media URL and determine type
const getMediaType = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;
    const urlLower = url.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (imageExtensions.some(ext => urlLower.endsWith(ext))) return 'image';
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.gif'];
    if (videoExtensions.some(ext => urlLower.endsWith(ext))) return 'video';
    return null;
};

// ===============================
// MENU COMMAND
// ===============================
cmd({
    pattern: "menu",
    alias: ["m", "fullmenu"],
    use: '.menu',
    desc: "Show all bot commands",
    category: "main",
    react: "🧾",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, userConfig }) => {
    try {
        const BOT_NAME    = userConfig?.BOT_NAME    || config.BOT_NAME    || "KHAN-MD";
        const OWNER_NAME  = userConfig?.OWNER_NAME  || config.OWNER_NAME  || "KHAN MD";
        const PREFIX      = userConfig?.PREFIX      || config.PREFIX      || ".";
        const VERSION     = userConfig?.VERSION     || config.VERSION     || "1.0.0";
        const MODE        = userConfig?.MODE        || config.MODE        || "public";
        const BOT_IMAGE   = userConfig?.BOT_IMAGE   || config.BOT_IMAGE   || "";
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "© POWERED BY KHAN-MD";

        await conn.sendPresenceUpdate('composing', from);

        const commandsArray = Array.isArray(commands) ? commands : Object.values(commands);
        let totalCommands = commandsArray.length;

        const categories = [...new Set(commandsArray.map(c => c.category))].filter(cat =>
            cat && cat.trim() !== '' && cat !== 'undefined'
        );

        const sortedCategories = categories.sort((a, b) => a.localeCompare(b));

        const categorized = {};
        sortedCategories.forEach(cat => {
            const categoryCommands = commandsArray.filter(c => c.category === cat);
            const validCommands = categoryCommands.filter(cmd => cmd.pattern && cmd.pattern.trim() !== '');
            if (validCommands.length > 0) categorized[cat] = validCommands;
        });

        let menuSections = '';
        for (const [category, cmds] of Object.entries(categorized)) {
            if (cmds && cmds.length > 0) {
                const section = formatCategory(category, cmds);
                if (section !== '') menuSections += section;
            }
        }

        // Main menu header — matches your target output exactly
        let dec = `╭┈───〔 *${BOT_NAME}* 〕──┈─⊷
│ *• 👑 ᴏᴡɴᴇʀ:* ${OWNER_NAME}
│ *• 📄 ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs:* ${totalCommands}
│ *• 🚀 ʀᴜɴᴛɪᴍᴇ:* ${runtime(process.uptime())}
│ *• 📝 ᴘʀᴇғɪx:* ${PREFIX}
│ *• 📢 ᴍᴏᴅᴇ:* ${MODE}
│ *• 🤖 ᴠᴇʀsɪᴏɴ:* ${VERSION}
╰────────────────┈─⊷
${menuSections}

> *${DESCRIPTION}*`;

        let mediaData;
        const localImagePath = path.join(__dirname, '../lib/jawadmd.jpg');
        const mediaType = getMediaType(BOT_IMAGE);

        if (mediaType === 'image' || mediaType === 'video') {
            try {
                await axios.head(BOT_IMAGE, { timeout: 3000 });
                mediaData = { [mediaType]: { url: BOT_IMAGE } };
            } catch (serverError) {
                console.log('Media server down, using local image:', serverError.message);
                mediaData = { image: { url: localImagePath } };
            }
        } else {
            mediaData = { image: { url: localImagePath } };
        }

        await conn.sendMessage(from, {
            ...mediaData,
            caption: dec,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363430297481707@newsletter',
                    newsletterName: BOT_NAME,
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
