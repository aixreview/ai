// plugins/raw.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

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
