# LTElections Website
If you're seeing this - you're part of an exclusive club that only Toadally lets see! Within this project there are a few programs -
* Nuxt.JS API server
* Nuxt.JS routes/SSR server
* Mapgen

## Starting the Website
Create a `.env` file in the root directory, and add the following contents:
```bash
LTE_API_KEY = your_api_key_here
REDIS_HOST = redis-host-some-website.com
REDIS_PASSWORD = some_password
PORT = 1234
```

Next, make sure all dependencies are installed.
```bash
yarn
```

Once installed, run the server with
```bash
yarn dev
```
Or, if you want to expose the website,
```bash
yarn dev --host
```
You can connect to the website with localhost:3000.

## Using the Mapgen tool
Built in to the repository is a tool to generate all necessary `.topojson` files to use with D3.js. Before running, make sure all dependencies are installed.
```bash
yarn
```
Next, to run the mapgen tool, run the following command:
```bash
yarn mapgen
```
All files will be outputted in the `maps/` directory.
