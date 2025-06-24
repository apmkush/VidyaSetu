
import { isPointWithinRadius } from 'geolib';

export function verifyLocation(classLocation, studentLocation, radius) {
  return isPointWithinRadius(
    { latitude: studentLocation.lat, longitude: studentLocation.lng },
    { latitude: classLocation.coordinates[1], longitude: classLocation.coordinates[0] },
    radius
  );
}
