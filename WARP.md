# BrewTokens - MEVN Webapp #
- a rewards program for breweries to use. 

# Structure #
- fe, be folders represent frontend and backend

# Frontend(s) #
- the frontend is a vue app running at /Users/nick/repos/brewbucks/fe
- the fe/.env variable VITE_API_URL is how the frontend calls the backend (this is the baseUrl)
- always build nice, clean, high contrast UI, similar to Uber. Use solid black buttons for primary
- do not use any "scale" hover animations

### Never start or restart processes ###
- Do NOT run: `npm run dev`, `yarn dev`, `node server.js`, `vite`, `pm2 start`, `pm2 restart`, `pm2 reload`.
- Only observe status and view logs.
- If a service is offline, STOP and ask for permission before starting anything.

### The only allowed commands ###
- Status (all):      pm2 ls
- Status (one):      pm2 describe <app>
- Recent logs:       pm2 logs <app> --lines 200 --timestamp
- Bounded follow:    timeout 20s pm2 logs <app> --lines 200 --timestamp
- One-shot tail:     pm2 logs <app> --lines 500 --nostream --timestamp
- Process metrics:   pm2 monit (read-only dashboard; don’t press keys to kill/restart)

### App names (adjust to your setup) ###
- Web (Vue/Vite):    brew-vue
- API (Node/Express): brew-api

## Backend ##
- backend is node express, in /Users/nick/repos/brewbucks/be
- always build robust, error-handling code


# Database #
- all services connect to the same backend, which connects to one local mongodb instance (see be/.env for MONGODB_URL)

