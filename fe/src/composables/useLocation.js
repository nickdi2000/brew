import { ref } from 'vue'

const locationData = ref({
  city: '',
  country: '',
  state: '',
  lat: '',
  long: '',
  zip: '',
  continent_code: ''
})

const isLoading = ref(false)
const hasLoaded = ref(false)

export function useLocation() {
  const getLocation = async () => {
    // Check if we've already loaded location
    if (hasLoaded.value) {
      return locationData.value
    }

    // Check localStorage first
    const storedLocation = localStorage.getItem('register-loc')
    if (storedLocation) {
      try {
        locationData.value = JSON.parse(storedLocation)
        hasLoaded.value = true
        return locationData.value
      } catch (error) {
        console.error('Error parsing stored location:', error)
      }
    }

    // Fetch location from API
    isLoading.value = true
    const API_KEY = import.meta.env.VITE_GEO_API_KEY
    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      const location = {
        city: data.city || '',
        country: data.country_name || '',
        state: data.state_prov || '',
        lat: data.latitude || '',
        long: data.longitude || '',
        zip: data.zipcode || '',
        continent_code: data.continent_code || ''
      }

      locationData.value = location
      localStorage.setItem('register-loc', JSON.stringify(location))
      hasLoaded.value = true
      
      return location
    } catch (error) {
      console.error('Error fetching location:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const getLocationSync = () => {
    // Return current location without fetching
    const storedLocation = localStorage.getItem('register-loc')
    if (storedLocation) {
      try {
        return JSON.parse(storedLocation)
      } catch (error) {
        console.error('Error parsing stored location:', error)
      }
    }
    return locationData.value
  }

  const clearLocation = () => {
    locationData.value = {
      city: '',
      country: '',
      state: '',
      lat: '',
      long: '',
      zip: '',
      continent_code: ''
    }
    hasLoaded.value = false
    localStorage.removeItem('register-loc')
  }

  return {
    locationData,
    isLoading,
    hasLoaded,
    getLocation,
    getLocationSync,
    clearLocation
  }
}

