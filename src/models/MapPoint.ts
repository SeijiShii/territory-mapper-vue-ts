import StringUtils from "@/utils/StringUtils";

export default class MapPoint {
    lat = 0;
    lng = 0;
    id: string = StringUtils.generateId('map_point');

    get latLng() {
        return {lat: this.lat, lng: this.lng};
    }

    clone() {
        const cloned = new MapPoint();
        cloned.lat = this.lat;
        cloned.lng = this.lng;
        cloned.id = this.id;
        return cloned;
    }
}

