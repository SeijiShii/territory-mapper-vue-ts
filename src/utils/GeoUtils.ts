export default class GeoUtils {

    public static getRadian(pivotLatLng: any, armLatLng: any): number {
        let r = Math.atan2(armLatLng.lat() - pivotLatLng.lat(), armLatLng.lng() - pivotLatLng.lng());

        if (r < 0) {
            r += Math.PI * 2;
        }
        return r;
    }
}
