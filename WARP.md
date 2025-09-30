# BrewTokens - MEVN Webapp #
- a rewards program for breweries to use. 

## Structure ##
- fe, be folders represent frontend and backend

## Frontend(s) ##
- the frontend is a vue app running at /Users/nick/repos/brewbucks/fe
- the fe/.env variable VITE_API_URL is how the frontend calls the backend (this is the baseUrl)
- always build nice, clean, high contrast UI, similar to Uber. Use solid black buttons for primary
- do not use any "scale" hover animations

# local development #
- when starting the backend or frontend server, always just kill the port first, then run it in the background
- be port: 3391
- fe port: 5644

## Backend ##
- backend is node express, in /Users/nick/repos/brewbucks/be
- always build robust, error-handling code


## Database ##
- all services connect to the same backend, which connects to one local mongodb instance (see be/.env for MONGODB_URL)

