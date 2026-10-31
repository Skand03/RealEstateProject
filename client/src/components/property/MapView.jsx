import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { formatPrice } from '../../utils/formatters';

// Fix Leaflet default marker icon issue with Vite
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapView = ({ latitude, longitude, title, price, listingType, height = '400px' }) => {
  if (!latitude || !longitude) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"
      >
        Location not available
      </div>
    );
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height, width: '100%' }}
      className="rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{title}</p>
            <p className="text-primary-600">{formatPrice(price, listingType)}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
