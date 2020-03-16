import StringUtils from "@/utils/StringUtils";

export default class MapPoint {
    id: string = StringUtils.generateId('map_point');
    marker: any = null;

    get latLng() {
        if (!this.marker) {
            throw new Error('Marker is not assigned!')
        }
        return this.marker.position;
    }

}

