# pontus-bot
pontus-bot is a Node.js based Telegram bot with multiple functions, mainly featuring a file indexer, targeted at distributing open-source APK files and modified versions. Built with Telegraf.

It can be a great way to offer easy access to your open-source Android apps and/or forks over Telegram.

I am new to creating Telegram bots, so excuse the clutter and possibly unoptimized code.

## Installation
### Non-Dockerized
1. **Clone the repository**
   ```bash
   git clone https://github.com/ihatenodejs/pontus-bot.git
   cd pontus-bot
   ```
2. **Install dependancies**
   ```bash
   npm install
   ```
3. **Change environment variables**

   Copy the `.env.example` file to `.env`, and add your own data in. You may obtain `BOT_TOKEN` from @BotFather.

   ```bash
   cp .env.example .env
   ```

   After copying, you may delete the `.env.example` file.
4. **Set up file directory**

   Create a `files` directory to serve files from. Copy all files you would like to serve to users into this directory, and edit the `files.json` file to match the correct path.

   ```bash
   mkdir files
   ```
5. **Set up your file index**

   Copy the `files.json.example` to `files.json`, and add your own data in.

   ```bash
   cp files.json.example files.json
   ```

   The example file showcases two situations where there may be one or many architectures.
6. **Run the bot**
   ```bash
   node bot.js
   ```
### Dockerized
1. **Clone the repository**
   ```bash
   git clone https://github.com/ihatenodejs/pontus-bot.git
   cd pontus-bot
   ```
2. **Change environment variables**

   Copy the `.env.example` file to `.env`, and add your own data in. You may obtain `BOT_TOKEN` from @BotFather.

   ```bash
   cp .env.example .env
   ```

   After copying, you may delete the `.env.example` file.
3. **Set up file directory**

   Create a `files` directory to serve files from. Copy all files you would like to serve to users into this directory, and edit the `files.json` file to match the correct path.

   ```bash
   mkdir files
   ```
4. **Set up your file index**

   Copy the `files.json.example` to `files.json`, and add your own data in.

   ```bash
   cp files.json.example files.json
   ```

   The example file showcases two situations where there may be one or many architectures.
5. **Build and run the Docker container**

   **5a.** Copy the example docker-compose file
   ```bash
   cp docker-compose.yml.example docker-compose.yml
   ```
   **5b.** Create the bot.log file
   ```bash
   touch bot.log
   ```
   **5c.** Build and run
   ```bash
   npm install # This should be run on the host, not inside the Docker container

   docker-compose up -d # If you are not using docker-compose-plugin
   docker compose up -d # If you are using docker-compose-plugin
   ```

   This will install needed dependancies, pull the Docker image and start the bot in a Docker container. You may also build with the included Dockerfile if you wish.
## Commands
PontusBot has the following commands:

- `/start` - Starts the bot and displays a welcome/help message
- `/help` - Shows help menu with an organized menu (buttons) of avaliable commands
- `about` - Shows information about the bot
- `/files list` - Lists all files in the database
- `/files get <id>` - Fetches details and download link of a file

## Contributing
Any and all contributions are welcomed! Please open issues and/or pull requests as you see fit :)