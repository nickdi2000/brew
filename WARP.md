# BrewTokens - MEVN Webapp #

a rewards program for breweries to use. 

## Structure ##
- fe, be folders represent frontend and backend

## Frontend(s) ##
- the frontend is a vue app running at /Users/nick/repos/brewbucks/fe
- the fe/.env variable VITE_API_URL is how the frontend calls the backend (this is the baseUrl)

## Backend ##
- backend is node express, in /Users/nick/repos/brewbucks/be

## Database ##
- all services connect to the same backend, which connects to one local mongodb instance (see be/.env for MONGODB_URL)

