// plugins/raw.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== STRUCTURE (owner only) ====================
cmd({
    pattern: "structure",
    alias: ["raw", "debug"],
    desc: "Shows raw Baileys message structure",
    category: "utility",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return reply("*📛 This is an owner command.*");
        }

        // Directly send the formatted mek object
        const content = JSON.stringify(mek, null, 2);

        // Simple reply with the content
        return reply(`${content}`);

    } catch (e) {
        console.error("Error in raw command:", e);
        reply("Error: " + e.message);
    }
});

// ==================== STRUCTURE2 (no restriction) ====================
cmd({
    pattern: "structure2",
    alias: ["raw2", "debug2"],
    desc: "Shows raw Baileys message structure",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Directly send the formatted mek object
        const content = JSON.stringify(mek, null, 2);

        // Simple reply with the content
        return reply(`${content}`);

    } catch (e) {
        console.error("Error in raw command:", e);
        reply("Error: " + e.message);
    }
});

// ==================== FETCH2 COMMAND ====================
cmd({
    pattern: "fetch2",
    alias: ["chfetch", "chmsg"],
    react: "📥",
    desc: "Fetch recent messages from a WhatsApp channel",
    category: "group",
    use: ".fetch2 <channel_post_url> [count]",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            return reply(
                `❌ *Provide a channel URL*\n\n` +
                `*Usage:*\n` +
                `.fetch2 <url> [count]\n\n` +
                `*Examples:*\n` +
                `.fetch2 https://whatsapp.com/channel/ABC/123\n` +
                `.fetch2 https://whatsapp.com/channel/ABC/123 30`
            );
        }

        const url = args[0];
        const urlMatch = url.match(/whatsapp\.com\/channel\/([A-Za-z0-9]+)(?:\/(\d+))?/);
        if (!urlMatch) return reply(`❌ Invalid channel URL.`);
        const [, inviteId] = urlMatch;

        const count = Math.min(Number(args[1]) || 20, 100);

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // 1) invite -> channel JID (official)
        const meta = await conn.newsletterMetadata('invite', inviteId);
        if (!meta?.id) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ Channel not found.`);
        }
        const channelJid = meta.id;

        // 2) fetch directly — official method returns raw IQ node
        const result = await conn.newsletterFetchMessages(channelJid, count);

        // 3) reply with raw result
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        return reply(
            `📥 *Channel:* ${meta.name || channelJid}\n` +
            `🆔 ${channelJid}\n` +
            `📨 *Count requested:* ${count}\n\n` +
            `*Raw result:*\n` +
            '```' + JSON.stringify(result, null, 2).slice(0, 4000) + '```'
        );

    } catch (error) {
        console.error("fetch2 error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {});
        return reply(`❌ *Error:* ${error.message}`);
    }
});
