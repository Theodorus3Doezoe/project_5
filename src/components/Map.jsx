import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

const MapView = () => { 
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  

  const handleClick = (latlng) => {
    console.log(latlng.lat, latlng.lng);
    setMarkers([...markers, latlng]);

    window.electronAPI.saveCoordinates({
    lat: latlng.lat,
    lng: latlng.lng,
  });
  };

  const testFetch = () => {
    console.log('trying');
    fetch("https://localhost:7063/api/test?name=ElectronUser")
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error('Fetch error:', err));
  };

  useEffect(() => {   
window.electronAPI.getCoordinates()
    .then(coords => {
      if (coords.length > 0) {
        const mapped = coords.map(({ breedtegraad, lengtegraad }) => ({
          lat: breedtegraad,
          lng: lengtegraad,
        }));
        setMarkers(mapped);}
    });

window.electronAPI.getIPInfo()
    .then(data => {
      const { latitude, longitude } = data;
      setUserLocation({ lat: latitude, lng: longitude });
      setMarkers([{ lat: latitude, lng: longitude }]);
    })
    .catch((err) => {
      console.error("IP-based location error:", err);
      setUserLocation({ lat: 51.505, lng: -0.09 }); // fallback
    });
}, []);


  return (
    <div>
      {userLocation && (
  <MapContainer
    center={[userLocation.lat, userLocation.lng]}
    zoom={13}
    style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
/>
        {markers.map((pos, idx) => (
          <Marker key={idx} position={[pos.lat, pos.lng]} />
        ))}
        <ClickHandler onClick={handleClick} />
      </MapContainer>
      )}
    </div>
  );
}; 

export default MapView;