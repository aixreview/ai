// plugins/fetch2.js
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// safe stringify — handles undefined, Buffer, BigInt, circular
function safeStringify(value) {
    try {
        return JSON.stringify(value, (k, v) => {
            if (typeof v === 'bigint') return v.toString() + 'n';
            if (v && typeof v === 'object' && v.type === 'Buffer' && Array.isArray(v.data)) {
                return { __buffer__: Buffer.from(v.data).toString('hex') };
            }
            return v;
        }, 2) ?? 'undefined';
    } catch (e) {
        return `[stringify error: ${e.message}]\n${String(value)}`;
    }
}

// ==================== FETCH2 COMMAND ====================
cmd({
    pattern: "fetch2",
    alias: ["chfetch", "chmsg"],
    react: "📥",
    desc: "Fetch recent messages from a WhatsApp channel and send raw result as file",
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

        // 1) invite -> channel JID
        const meta = await conn.newsletterMetadata('invite', inviteId);
        if (!meta?.id) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ Channel not found.`);
        }
        const channelJid = meta.id;

        // 2) fetch directly — whatever it returns, we take it
        const result = await conn.newsletterFetchMessages(channelJid, count);

        // 3) dump everything to file
        const text = safeStringify(result);
        const dir = join(process.cwd(), 'tmp');
        try { mkdirSync(dir, { recursive: true }); } catch {}
        const filename = `fetch2_${channelJid.split('@')[0]}_${Date.now()}.txt`;
        const filepath = join(dir, filename);
        writeFileSync(filepath, text, 'utf-8');

        // 4) send the file
        await conn.sendMessage(from, {
            document: { url: filepath },
            mimetype: 'text/plain',
            fileName: filename,
            caption:
                `📥 *Channel:* ${meta.name || channelJid}\n` +
                `🆔 ${channelJid}\n` +
                `📨 *Count requested:* ${count}\n` +
                `📦 *Size:* ${text.length} bytes\n` +
                `📄 *Type:* ${result === undefined ? 'undefined' : result === null ? 'null' : typeof result}\n\n` +
                `> *Powered By JAWAD-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("fetch2 error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {});
        return reply(`❌ *Error:* ${error.message}`);
    }
});
