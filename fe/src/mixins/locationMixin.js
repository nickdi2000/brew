export default {
	data() {
		return {
			_location: {
				city: "",
				country: "",
				state: "",
				lat: "",
				long: "",
				zip: "",
			},
		};
	},
	methods: {
		async _getGeo() {
			const registerLocation = localStorage.getItem("register-loc");
			if (registerLocation) {
				this._location = JSON.parse(registerLocation);
				return;
			}

			const API_KEY = import.meta.env.VITE_GEO_API_KEY;
			const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`;
			try {
				const rec = await fetch(url);
				const data = await rec.json();
				const _location = {
					city: data.city,
					country: data.country_name,
					state: data.state_prov,
					lat: data.latitude,
					long: data.longitude,
					state: data.state_prov,
					zip: data.zipcode,
					continent_code: data.continent_code,
				};

				this._location = _location;
				await this.$store.setLocale(data.state_code);
				localStorage.setItem("register-loc", JSON.stringify(_location));

				this._setUserStatus();
			} catch (error) {
				console.log("error getting geo", error);
			}
		},

		_setUserStatus() {
			const excludedContinents = ["AF", "OC", "SA", "AN"]; //anything outside of north america
			const continentCode = this._location.continent_code;

			// Check if continent code is not in the excluded list or is undefined
			const status =
				!continentCode || !excludedContinents.includes(continentCode)
					? "active"
					: "free";

			this.form.status = status;
		},
	},
};
