// ping.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// Small caps helper
const toSmallCaps = (text) => {
    const map = {
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ',
        'j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ',
        's':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'
    };
    return text.split('').map(c => map[c.toLowerCase()] || c).join('');
};

cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;
        const ms = (end - start);

        let status;
        if (ms < 1000) status = `${toSmallCaps("fast")} ⚡`;
        else if (ms < 1400) status = `${toSmallCaps("normal")} ⚙️`;
        else status = `${toSmallCaps("slow")} 🐢`;

        const SC = toSmallCaps;
        const t = responseTime.toFixed(2);

        // ==========================================
        //  20 SIMPLE SHORT STYLES (bold + small caps)
        // ==========================================
        const styles = [
            `> *${SC("KHAN-MD SPEED")}: ${t}ᴍs ${reactionEmoji}*`,

            `> *${SC("PONG")}! ${t}ᴍs ${reactionEmoji}*`,

            `> *⚡ ${SC("Speed")}:* ${t}ᴍs`,

            `> *⚡ ${SC("Ping")}:* ${t}ᴍs ${reactionEmoji}*`,

            `> *🚀 ${SC("Response")}:* ${t}ᴍs`,

            `> *💫 ${t}ᴍs • ${status}*`,

            `> *📶 ${SC("Ping")}:* ${t}ᴍs • ${status}*`,

            `> *🎯 ${t}ᴍs ${reactionEmoji}*`,

            `*⚡ ${SC("KHAN-MD")}:* ${t}ᴍs`,

            `> *💨 ${t}ᴍs • ${SC("Active")} ✅*`,

            `> *⚡ *${SC("Pong")}!* ${t}ᴍs*`,

            `> *🔥 ${SC("Bot Speed")}:* ${t}ᴍs`,

            `> *📡 ${SC("Latency")}:* ${t}ᴍs ${reactionEmoji}*`,

            `> *⭐ ${SC("Speed")}:* ${t}ᴍs • ${status}*`,

            `> *💎 ${SC("Result")}:* ${t}ᴍs*`,

            `> *🏆 ${SC("KHAN-MD")} ⚡ ${t}ᴍs*`,

            `> *⚡ ${t}ᴍs • ${SC("online")} ✅*`,

            `> *🛡️ ${SC("Ping")}:* ${t}ᴍs • ${SC("stable")}*`,

            `> *🎉 ${SC("Wow")}! ${t}ᴍs ${reactionEmoji}*`,

            `> *💥 ${SC("Speed")}:* ${t}ᴍs • ${status} ${reactionEmoji}*`
        ];

        const text = styles[Math.floor(Math.random() * styles.length)];

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363430297481707@newsletter',
                    newsletterName: "JawadTechX",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 500));
        const endTime = Date.now();
        const ping = endTime - startTime;

        let status;
        if (ping < 1000) status = "⚡ *Fast & Responsive*";
        else if (ping < 1400) status = "⚙️ *Normal Speed*";
        else status = "🐢 *Slow Response*";

        const msg = `
*╭┈──〔 ⚡ Kʜᴀɴ-ᴍᴅ Pɪɴɢ 〕─⊷*
*├▢ 📶 Response:* ${ping} ms
*├▢ 🧠 Status:* ${status}
*├▢ 💫 Mode:* Active & Stable
*╰───────────────⊷*
        `;

        await conn.sendMessage(from, { text: msg.trim() }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`⚠️ Error: ${e.message}`);
    }
});