// plugins/fullpp.js
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import { Jimp } from 'jimp';
import { S_WHATSAPP_NET } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "fullpp",
    alias: ["setpp", "setdp", "pp", "setppbot"],
    react: "🖼️",
    desc: "Owner Only - Set bot's profile picture (square, no crop)",
    category: "owner",
    filename: __filename
}, async (client, message, m, { from, isCreator }) => {
    try {
        if (!isCreator) {
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }

        if (!m.quoted || m.quoted.mtype !== "imageMessage") {
            return await client.sendMessage(from, {
                text: "*🍁 Please reply to an image with .fullpp*"
            }, { quoted: message });
        }

        // 1. Download original image
        const buffer = await m.quoted.download();

        // 2. Jimp v1.6.1 → center square crop → scale 720 → JPEG buffer
        const jimpImg = await Jimp.read(buffer);
        const w = jimpImg.width;
        const h = jimpImg.height;
        const size = Math.min(w, h);
        const x = Math.floor((w - size) / 2);
        const y = Math.floor((h - size) / 2);

        jimpImg.crop({ x, y, w: size, h: size });
        jimpImg.scaleToFit({ w: 720, h: 720 });

        const img = await jimpImg.getBuffer('image/jpeg');

        // 3. Send raw IQ — your shared method
        await client.query({
            tag: 'iq',
            attrs: {
                target: undefined,
                to: S_WHATSAPP_NET,
                type: 'set',
                xmlns: 'w:profile:picture'
            },
            content: [{
                tag: 'picture',
                attrs: { type: 'image' },
                content: img
            }]
        });

        await client.sendMessage(from, {
            text: "*✅ Bot's profile picture updated successfully!*"
        }, { quoted: message });

    } catch (error) {
        console.error("fullpp Error:", error);
        await client.sendMessage(from, {
            text: "❌ Error updating profile picture:\n" + error.message
        }, { quoted: message });
    }
});
