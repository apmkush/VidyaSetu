
import { isPointWithinRadius } from 'geolib';

function verifyLocation(classLocation, studentLocation, radius) {
  return isPointWithinRadius(
    { latitude: studentLocation.lat, longitude: studentLocation.lng },
    { latitude: classLocation.coordinates[1], longitude: classLocation.coordinates[0] },
    radius
  );
}

export default { verifyLocation };