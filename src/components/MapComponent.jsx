import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Target, X, LocateFixed, ArrowUp, CornerUpLeft, CornerUpRight, MoveUpRight, MoveUpLeft, Flag, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';

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
    iconAnchor: [20, 20]
});

// Destination Icon
const DestinationIcon = L.divIcon({
    className: 'destination-marker',
    html: `<div class="destination-pin"><div class="pin-inner"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Help function to get direction icons
const getDirectionIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('left')) return <CornerUpLeft size={18} />;
    if (t.includes('right')) return <CornerUpRight size={18} />;
    if (t.includes('straight') || t.includes('head')) return <ArrowUp size={18} />;
    if (t.includes('slightright')) return <MoveUpRight size={18} />;
    if (t.includes('slightleft')) return <MoveUpLeft size={18} />;
    if (t.includes('destination')) return <Flag size={18} color="var(--primary)" />;
    return <ArrowUp size={18} />;
};

// Component to handle routing
const RoutingControl = ({ start, end, onRouteUpdate }) => {
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
            addWaypoints: false,
            lineOptions: {
                styles: [{ color: '#2979ff', weight: 6, opacity: 0.8 }]
            },
            createMarker: () => null
        }).addTo(map);

        const container = routingControl.getContainer();
        if (container) container.style.display = 'none';

        routingControl.on('routesfound', (e) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            const instructions = routes[0].instructions;
            onRouteUpdate({
                distance: (summary.totalDistance / 1000).toFixed(1), // km
                time: Math.round(summary.totalTime / 60), // minutes
                instructions: instructions
            });
        });

        return () => map.removeControl(routingControl);
    }, [map, start, end]);

    return null;
};

// Recenter Control
const RecenterButton = ({ position }) => {
    const map = useMap();
    return (
        <button
            className="map-recenter-btn"
            onClick={() => map.setView(position, 15)}
            title="Recenter on me"
        >
            <LocateFixed size={20} />
        </button>
    );
};

// Component to ensure map recalculates size on container changes
const ResizeHandler = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300); // Wait for CSS transitions

        window.addEventListener('resize', () => map.invalidateSize());
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', () => map.invalidateSize());
        };
    }, [map]);
    return null;
};

const MapComponent = ({ stations, userLocation, destination, center = [13.7563, 100.5018], zoom = 12, onMarkerClick, onExitNav }) => {
    const [routeInfo, setRouteInfo] = useState(null);
    const [showSteps, setShowSteps] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const mapRef = useState(null);

    // Sync current step when route is found
    useEffect(() => {
        if (routeInfo?.instructions) {
            setCurrentStepIndex(0);
        }
    }, [routeInfo]);

    const handleStepClick = (step, idx) => {
        setCurrentStepIndex(idx);
        // We'll use the map instance from a hidden child to zoom
    };

    // Component to handle map actions internally
    const MapActions = ({ focusPoint }) => {
        const map = useMap();
        useEffect(() => {
            if (focusPoint) {
                map.flyTo([focusPoint.lat, focusPoint.lng], 16, { animate: true });
            }
        }, [focusPoint, map]);
        return null;
    };

    const currentStep = routeInfo?.instructions?.[currentStepIndex];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ResizeHandler />
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {userLocation && destination && (
                    <RoutingControl
                        start={userLocation}
                        end={destination}
                        onRouteUpdate={setRouteInfo}
                    />
                )}

                {/* Focus map on selected step */}
                {routeInfo?.instructions?.[currentStepIndex] && (
                    <MapActions focusPoint={routeInfo.instructions[currentStepIndex].latLng} />
                )}

                {userLocation && <RecenterButton position={userLocation} />}

                {userLocation && (
                    <Marker position={userLocation} icon={UserLocationIcon}>
                        <Popup>Your current position</Popup>
                    </Marker>
                )}

                {destination && (
                    <Marker position={destination} icon={DestinationIcon} zIndexOffset={1000}>
                        <Popup>Destination Station</Popup>
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
                        <Popup className="station-popup">
                            <div style={{ color: '#fff', background: '#151b2b', padding: '5px' }}>
                                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{station.name}</strong><br />
                                <div style={{ fontSize: '0.8rem', margin: '5px 0', color: '#94a3b8' }}>{station.address}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span className={`badge ${station.status.toLowerCase()}`}>{station.status}</span>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMarkerClick(station);
                                        }}
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Google Maps Style Navigation Overlay */}
            {destination && routeInfo && (
                <div className={`nav-overlay ${showSteps ? 'expanded' : ''}`}>
                    <div className="nav-header">
                        <div className="nav-guidance-icon">
                            {currentStep ? getDirectionIcon(currentStep.type) : <Target color="var(--primary)" />}
                        </div>
                        <div className="nav-content-box">
                            <span className="nav-instruction-main">
                                {currentStep ? currentStep.text : "Navigating..."}
                            </span>
                            <span className="nav-subtitle">
                                {routeInfo.distance} km total • {routeInfo.time} mins left
                            </span>
                        </div>
                        <div className="nav-actions-overlay">
                            <button className="nav-toggle-steps" onClick={() => setShowSteps(!showSteps)}>
                                {showSteps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button className="nav-close" onClick={() => {
                                onExitNav();
                                setShowSteps(false);
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {showSteps && routeInfo.instructions && (
                        <div className="nav-steps-list">
                            {routeInfo.instructions.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`nav-step-item ${idx === currentStepIndex ? 'active-step' : ''}`}
                                    onClick={() => handleStepClick(step, idx)}
                                >
                                    <div className="step-icon">
                                        {getDirectionIcon(step.type)}
                                    </div>
                                    <div className="step-info">
                                        <p className="step-text">{step.text}</p>
                                        <span className="step-distance">
                                            {step.distance >= 1000
                                                ? (step.distance / 1000).toFixed(1) + ' km'
                                                : Math.round(step.distance) + ' m'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="nav-progress-bar">
                        <div className="nav-progress-fill"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
