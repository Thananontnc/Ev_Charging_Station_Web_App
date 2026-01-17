import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Target, X, LocateFixed, ArrowUp, CornerUpLeft, CornerUpRight, MoveUpRight, MoveUpLeft, Flag, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/MapMarker.css';

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

// Component to handle routing with alternative routes
const RoutingControl = ({ start, end, onRouteUpdate, showAlternatives = false }) => {
    const map = useMap();

    useEffect(() => {
        if (!start || !end) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            routeWhileDragging: false,
            showAlternatives: showAlternatives,
            altLineOptions: {
                styles: [
                    { color: '#9e9e9e', opacity: 0.6, weight: 4 }
                ]
            },
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
            const allRoutes = routes.map((route, idx) => ({
                summary: route.summary,
                instructions: route.instructions,
                distance: (route.summary.totalDistance / 1000).toFixed(1),
                time: Math.round(route.summary.totalTime / 60),
                eta: new Date(Date.now() + route.summary.totalTime * 1000),
                isAlternative: idx > 0
            }));

            onRouteUpdate(allRoutes);
        });

        return () => map.removeControl(routingControl);
    }, [map, start, end, showAlternatives]);

    return null;
};

// Recenter Control with smooth animation
const RecenterButton = ({ position }) => {
    const map = useMap();
    return (
        <button
            className="map-recenter-btn"
            onClick={() => map.flyTo(position, 16, {
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            })}
            title="Recenter on me"
        >
            <LocateFixed size={20} />
        </button>
    );
};

// 3D-Style Camera Controller
const CameraController = ({ target, zoom = 17, shouldFly }) => {
    const map = useMap();

    useEffect(() => {
        if (target && shouldFly) {
            // Smooth 3D-style flyTo animation
            map.flyTo([target.lat, target.lng], zoom, {
                animate: true,
                duration: 2,
                easeLinearity: 0.2
            });
        }
    }, [target, zoom, shouldFly, map]);

    return null;
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
    const [allRoutes, setAllRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [showSteps, setShowSteps] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [cameraTarget, setCameraTarget] = useState(null);
    const [shouldFlyToTarget, setShouldFlyToTarget] = useState(false);
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [showRouteOverview, setShowRouteOverview] = useState(false);
    const mapRef = useState(null);

    // Get current selected route
    const routeInfo = allRoutes[selectedRouteIndex];

    // Sync current step when route is found
    useEffect(() => {
        if (routeInfo?.instructions) {
            setCurrentStepIndex(0);
        }
    }, [routeInfo]);

    // Calculate ETA
    const getETAString = (eta) => {
        if (!eta) return '';
        const hours = eta.getHours();
        const minutes = eta.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // Calculate distance remaining based on current step
    const getDistanceRemaining = () => {
        if (!routeInfo?.instructions || currentStepIndex >= routeInfo.instructions.length) {
            return routeInfo?.distance || '0';
        }

        let remaining = 0;
        for (let i = currentStepIndex; i < routeInfo.instructions.length; i++) {
            remaining += routeInfo.instructions[i].distance;
        }
        return (remaining / 1000).toFixed(1);
    };

    const handleStepClick = (step, idx) => {
        setCurrentStepIndex(idx);
        // Trigger 3D-style camera movement to the step location
        if (step.latLng) {
            setCameraTarget({ lat: step.latLng.lat, lng: step.latLng.lng });
            setShouldFlyToTarget(true);
            setTimeout(() => setShouldFlyToTarget(false), 100);
        }
    };

    const handleMarkerClick = (station) => {
        // Smooth camera movement to station
        setCameraTarget({ lat: station.lat, lng: station.lng });
        setShouldFlyToTarget(true);
        setTimeout(() => setShouldFlyToTarget(false), 100);

        // Call parent callback
        if (onMarkerClick) {
            onMarkerClick(station);
        }
    };

    const handleRouteSelect = (index) => {
        setSelectedRouteIndex(index);
        setCurrentStepIndex(0);
    };

    const toggleRouteOverview = () => {
        setShowRouteOverview(!showRouteOverview);
        if (!showRouteOverview && userLocation && destination) {
            // Fit bounds to show entire route
            setCameraTarget(null);
        }
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

    // Component to fit route bounds
    const RouteBoundsHandler = ({ start, end, shouldFit }) => {
        const map = useMap();
        useEffect(() => {
            if (shouldFit && start && end) {
                const bounds = L.latLngBounds([start, end]);
                map.fitBounds(bounds, { padding: [50, 50], animate: true });
            }
        }, [shouldFit, start, end, map]);
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
                className={destination ? 'nav-active' : ''}
            >
                <ResizeHandler />
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* 3D Camera Controller */}
                <CameraController
                    target={cameraTarget}
                    zoom={17}
                    shouldFly={shouldFlyToTarget}
                />

                {/* Route Bounds Handler for Overview */}
                <RouteBoundsHandler
                    start={userLocation}
                    end={destination}
                    shouldFit={showRouteOverview}
                />

                {userLocation && destination && (
                    <RoutingControl
                        start={userLocation}
                        end={destination}
                        onRouteUpdate={setAllRoutes}
                        showAlternatives={showAlternatives}
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
                            click: () => handleMarkerClick(station),
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
                                            handleMarkerClick(station);
                                        }}
                                    >
                                        Navigate
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Enhanced Navigation Overlay */}
            {destination && routeInfo && (
                <div className={`nav-overlay ${showSteps ? 'expanded' : ''}`}>
                    {/* ETA and Distance Header */}
                    <div className="nav-eta-bar">
                        <div className="eta-item">
                            <span className="eta-label">ETA</span>
                            <span className="eta-value">{getETAString(routeInfo.eta)}</span>
                        </div>
                        <div className="eta-divider"></div>
                        <div className="eta-item">
                            <span className="eta-label">Remaining</span>
                            <span className="eta-value">{getDistanceRemaining()} km</span>
                        </div>
                        <div className="eta-divider"></div>
                        <div className="eta-item">
                            <span className="eta-label">Duration</span>
                            <span className="eta-value">{routeInfo.time} min</span>
                        </div>
                    </div>

                    {/* Main Navigation Header */}
                    <div className="nav-header">
                        <div className="nav-guidance-icon">
                            {currentStep ? getDirectionIcon(currentStep.type) : <Target color="white" />}
                        </div>
                        <div className="nav-content-box">
                            <span className="nav-instruction-main">
                                {currentStep ? currentStep.text : "Navigating..."}
                            </span>
                            <span className="nav-subtitle">
                                Then in {currentStep?.distance >= 1000
                                    ? (currentStep.distance / 1000).toFixed(1) + ' km'
                                    : Math.round(currentStep?.distance || 0) + ' m'}
                            </span>
                        </div>
                        <div className="nav-actions-overlay">
                            <button
                                className="nav-toggle-steps"
                                onClick={() => setShowSteps(!showSteps)}
                                title="Show all steps"
                            >
                                {showSteps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button
                                className="nav-close"
                                onClick={() => {
                                    onExitNav();
                                    setShowSteps(false);
                                    setShowAlternatives(false);
                                    setShowRouteOverview(false);
                                }}
                                title="Exit navigation"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Route Controls */}
                    <div className="nav-controls">
                        <button
                            className={`nav-control-btn ${showAlternatives ? 'active' : ''}`}
                            onClick={() => setShowAlternatives(!showAlternatives)}
                        >
                            <MapIcon size={16} />
                            <span>Routes</span>
                        </button>
                        <button
                            className={`nav-control-btn ${showRouteOverview ? 'active' : ''}`}
                            onClick={toggleRouteOverview}
                        >
                            <Target size={16} />
                            <span>Overview</span>
                        </button>
                    </div>

                    {/* Alternative Routes Selector */}
                    {showAlternatives && allRoutes.length > 1 && (
                        <div className="alt-routes-panel">
                            <h4 className="alt-routes-title">Choose Route</h4>
                            {allRoutes.map((route, idx) => (
                                <div
                                    key={idx}
                                    className={`alt-route-card ${idx === selectedRouteIndex ? 'selected' : ''}`}
                                    onClick={() => handleRouteSelect(idx)}
                                >
                                    <div className="alt-route-badge">
                                        {idx === 0 ? 'Fastest' : `Alt ${idx}`}
                                    </div>
                                    <div className="alt-route-info">
                                        <span className="alt-route-time">{route.time} min</span>
                                        <span className="alt-route-distance">{route.distance} km</span>
                                    </div>
                                    <div className="alt-route-eta">
                                        ETA: {getETAString(route.eta)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
