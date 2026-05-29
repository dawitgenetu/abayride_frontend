import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Radio, MapPin, Navigation, Circle } from 'lucide-react';
import { fetchDriverLocations } from '../services/api';
import { PageHeader } from './PageHeader';
import { useToast } from '../context/ToastContext';

const DEFAULT_CENTER = [11.5936, 37.3908];
const DEFAULT_ZOOM = 13;
const POLL_MS = 12_000;

const driverIcon = L.divIcon({
  className: '',
  html: '<div class="fleet-marker fleet-marker-online"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const driverOfflineIcon = L.divIcon({
  className: '',
  html: '<div class="fleet-marker fleet-marker-offline"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const pickupIcon = L.divIcon({
  className: '',
  html: '<div class="fleet-marker fleet-marker-pickup"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function formatAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleString();
}

function isStale(iso) {
  if (!iso) return true;
  return Date.now() - new Date(iso).getTime() > 120_000;
}

export const DriverFleetMap = () => {
  const toast = useToast();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const rideLayer = useRef(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [fleet, setFleet] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);

  const isDark = () =>
    document.body.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark';

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const { data } = await fetchDriverLocations({
        online_only: onlineOnly ? 'true' : 'false',
        include_rides: 'true',
      });
      setFleet(data.drivers ?? []);
      setActiveRides(data.active_rides ?? []);
      setStats(data.stats ?? null);
      setUpdatedAt(data.updated_at ?? new Date().toISOString());
    } catch {
      setError('Could not load fleet locations');
      if (!silent) toast('Failed to load fleet map', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onlineOnly, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.control.zoom({ position: 'topright' }).addTo(map);

    const tile = L.tileLayer(
      isDark()
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 20, attribution: '&copy; OpenStreetMap contributors' }
    );
    tile.addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    rideLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markersLayer.current = null;
      rideLayer.current = null;
    };
  }, []);

  // Swap tiles on theme change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const map = mapInstance.current;
      if (!map) return;
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
      });
      L.tileLayer(
        isDark()
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 20, attribution: '&copy; OpenStreetMap contributors' }
      ).addTo(map);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Update markers when fleet / rides change
  useEffect(() => {
    const map = mapInstance.current;
    const layer = markersLayer.current;
    const rides = rideLayer.current;
    if (!map || !layer || !rides) return;

    layer.clearLayers();
    rides.clearLayers();

    const bounds = [];

    fleet.forEach((d) => {
      const pos = [d.lat, d.lng];
      bounds.push(pos);
      const stale = isStale(d.location_at);
      const marker = L.marker(pos, {
        icon: d.is_online && !stale ? driverIcon : driverOfflineIcon,
      });
      marker.bindPopup(
        `<strong>${d.name}</strong><br/>${d.car_info || ''}<br/>` +
          `${d.is_online ? 'Online' : 'Offline'} · ${formatAgo(d.location_at)}` +
          (d.phone ? `<br/>${d.phone}` : '')
      );
      marker.on('click', () => setSelectedId(d.user_id));
      marker.addTo(layer);
    });

    activeRides.forEach((r) => {
      const p = r.pickup_location;
      if (p?.lat == null || p?.lng == null) return;
      const pos = [Number(p.lat), Number(p.lng)];
      bounds.push(pos);
      L.marker(pos, { icon: pickupIcon })
        .bindPopup(`Ride #${String(r.id).slice(0, 8)}…<br/>Status: ${r.status}`)
        .addTo(rides);
      if (r.destination_location?.lat != null) {
        const dpos = [Number(r.destination_location.lat), Number(r.destination_location.lng)];
        bounds.push(dpos);
        L.polyline([pos, dpos], { color: '#f59e0b', weight: 2, dashArray: '6 4', opacity: 0.7 }).addTo(rides);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [fleet, activeRides]);

  const focusDriver = (d) => {
    setSelectedId(d.user_id);
    const map = mapInstance.current;
    if (map && d.lat != null) map.setView([d.lat, d.lng], 16, { animate: true });
  };

  return (
    <div>
      <PageHeader
        badge="Live"
        title="Fleet map"
        subtitle="Track approved drivers in real time. Locations update from the driver app every few seconds while online."
        actions={
          <>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Online only
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Auto-refresh
            </label>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="btn-ghost inline-flex items-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Online drivers', value: stats?.online ?? '—', icon: Radio },
          { label: 'On map (GPS)', value: stats?.with_location ?? fleet.length, icon: MapPin },
          { label: 'Active rides', value: activeRides.length, icon: Navigation },
          { label: 'Last sync', value: updatedAt ? formatAgo(updatedAt) : '—', icon: Circle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card p-4">
            <div className="flex items-center gap-2 text-gray-400 dark:text-dark-muted mb-1">
              <Icon size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-secondary dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 min-h-[520px]">
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-premium bg-gray-100 dark:bg-dark-surface">
          {loading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 dark:bg-dark-bg/70 backdrop-blur-sm">
              <RefreshCw className="animate-spin text-primary" size={28} />
            </div>
          )}
          <div ref={mapRef} className="h-[min(70vh,640px)] w-full fleet-map" />
          <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap gap-3 text-[11px] font-medium bg-white/90 dark:bg-dark-surface/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-100 dark:border-dark-border">
            <span className="flex items-center gap-1.5">
              <span className="fleet-marker fleet-marker-online w-3 h-3" /> Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="fleet-marker fleet-marker-offline w-3 h-3" /> Offline / stale
            </span>
            <span className="flex items-center gap-1.5">
              <span className="fleet-marker fleet-marker-pickup w-2.5 h-2.5" /> Active ride pickup
            </span>
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface shadow-premium flex flex-col max-h-[min(70vh,640px)]">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
            <h2 className="text-sm font-bold text-secondary dark:text-white">Drivers ({fleet.length})</h2>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              Tap a row to focus on the map
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-dark-border">
            {fleet.length === 0 && !loading && (
              <li className="p-6 text-center text-sm text-gray-400 dark:text-dark-muted">
                {onlineOnly
                  ? 'No online drivers with GPS right now.'
                  : 'No drivers with a saved location yet.'}
              </li>
            )}
            {fleet.map((d) => {
              const stale = isStale(d.location_at);
              const active = selectedId === d.user_id;
              return (
                <li key={d.user_id}>
                  <button
                    type="button"
                    onClick={() => focusDriver(d)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors ${
                      active ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-secondary dark:text-white truncate">
                          {d.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-dark-muted truncate">{d.car_info}</p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          d.is_online && !stale ? 'badge-success' : 'badge-warn'
                        }`}
                      >
                        {d.is_online && !stale ? 'live' : stale ? 'stale' : 'off'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-1 font-mono">
                      {d.lat.toFixed(5)}, {d.lng.toFixed(5)} · {formatAgo(d.location_at)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
};
