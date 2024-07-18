   // Initialize the map
   var map = L.map('map').setView(listing.geometry, 13);

   // Add the tile layer - replace with your preferred tile provider
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   }).addTo(map);
   
   var greenIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

   // Add a marker for the listing location
   L.marker(listing.geometry,{icon: greenIcon}).addTo(map)
   .bindPopup(listing.location)
      .on('mouseover', function (e) {
            this.openPopup();
        })
      .on('mouseout', function (e) {
            this.closePopup();
        });


   var circle = L.circle(geometry, {
      color: 'blue',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
  }).addTo(map);