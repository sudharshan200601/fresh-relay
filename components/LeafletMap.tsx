'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons in React/Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activePickupIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `<div style="background-color: #2ECC71; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const dropoffIcon = L.divIcon({
  className: 'custom-map-pin-drop',
  html: `<div style="background-color: #3498DB; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    address: string;
    status?: string;
    type?: 'pickup' | 'dropoff';
  }>;
  showRoute?: boolean;
  className?: string;
}

function MapReCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function LeafletMap({
  center = [37.7749, -122.4194],
  zoom = 13,
  markers = [],
  showRoute = false,
  className = 'h-72 w-full rounded-2xl overflow-hidden shadow-inner',
}: MapProps) {
  // Sample SF shelter drop-off location
  const dropoffPosition: [number, number] = [37.7858, -122.4089];

  const routePolyline: [number, number][] =
    markers.length > 0
      ? [
          markers[0].position,
          [
            (markers[0].position[0] + dropoffPosition[0]) / 2 + 0.003,
            (markers[0].position[1] + dropoffPosition[1]) / 2 - 0.002,
          ],
          dropoffPosition,
        ]
      : [];

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full rounded-2xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapReCenter center={center} />

        {/* Render Pickup Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={marker.type === 'dropoff' ? dropoffIcon : activePickupIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h4 className="font-bold text-slate-800 text-xs">{marker.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">{marker.address}</p>
                {marker.status && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {marker.status}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* If route enabled, show shelter dropoff marker too */}
        {showRoute && markers.length > 0 && (
          <Marker position={dropoffPosition} icon={dropoffIcon}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-slate-800 text-xs">St. Jude Community Shelter</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">333 O'Farrell St, SF</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-800">
                  Destination Dropoff
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic Route Polyline */}
        {showRoute && routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#3498DB',
              weight: 5,
              opacity: 0.8,
              dashArray: '8, 8',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
