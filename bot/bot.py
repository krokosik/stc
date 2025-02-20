import asyncio
import logging
import os
from urllib.parse import quote_plus

import aiohttp
from telethon import TelegramClient, events
from telethon.tl.types import DocumentAttributeFilename

app_id = int(os.environ.get("APP_ID"))
app_hash = os.environ.get("APP_HASH")
bot_token = os.environ.get("BOT_TOKEN")


async def main():
    logging.basicConfig(level=logging.INFO)
    telegram_client = TelegramClient("bot", app_id, app_hash)
    await telegram_client.start(bot_token=bot_token)
    async with aiohttp.ClientSession(base_url="http://127.0.0.1:8080") as ipfs_session:

        @telegram_client.on(events.NewMessage)
        async def file_handler(event):
            maybe_doi = event.raw_text.strip()
            file_name = f"{maybe_doi}.pdf"
            logging.info(f"received request {maybe_doi}")

            response = await ipfs_session.get(
                f"/ipns/dois.libstc.cc/{quote_plus(quote_plus(maybe_doi.lower())).lower()}.pdf"
            )
            if response.status == 200:
                return await telegram_client.send_file(
                    entity=event.chat_id,
                    file=await response.read(),
                    attributes=[DocumentAttributeFilename(file_name)],
                )
            elif response.status == 404:
                return await event.reply(f"`{maybe_doi}` not found!")
            else:
                logging.info(f"received bad response {response}")

        await telegram_client.run_until_disconnected()


asyncio.run(main())
