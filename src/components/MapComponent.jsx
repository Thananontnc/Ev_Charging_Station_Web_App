import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom Google Maps Style User Location Icon
const UserLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div class="user-location-pulse"></div><div class="user-location-dot"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20] // Center of the 40x40 icon
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle routing
const RoutingControl = ({ start, end }) => {
    const map = useMap();

    useEffect(() => {
        if (!start || !end) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#00e676', weight: 6 }]
            },
            createMarker: () => null
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, start, end]);

    return null;
};

const MapComponent = ({ stations, userLocation, destination, center = [13.7563, 100.5018], zoom = 12, onMarkerClick }) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Show Route if destination is set */}
            {userLocation && destination && (
                <RoutingControl start={userLocation} end={destination} />
            )}

            {/* User Location Marker */}
            {userLocation && (
                <Marker position={userLocation} icon={UserLocationIcon}>
                    <Popup>You are Here</Popup>
                </Marker>
            )}

            {stations.map((station) => (
                <Marker
                    key={station.id}
                    position={[station.lat, station.lng]}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(station),
                    }}
                >
                    <Popup>
                        <div style={{ color: '#000' }}>
                            <strong>{station.name}</strong><br />
                            {station.address}<br />
                            <span style={{
                                color: station.status === 'Available' ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {station.status}
                            </span>
                            {/* Navigation Button in Popup */}
                            <button
                                style={{
                                    marginTop: '8px',
                                    display: 'block',
                                    width: '100%',
                                    padding: '6px',
                                    background: '#2979ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent map click
                                    onMarkerClick(station);
                                }}
                            >
                                Navigate Here
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
