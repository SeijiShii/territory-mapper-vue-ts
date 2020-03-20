export default class GoogleHelper {

    private static _instance: GoogleHelper;

    private constructor() {
        //
    }

    private _google: any = null;
    public get google(): any {
        return this._google
    }

    private _map: any = null;
    public get map(): any {
        return this._map
    }

    public static initialize(google: any, map: any) {
        this.instance._google = google;
        this.instance._map = map;
    }

    public static get instance(): GoogleHelper {
        if (!this._instance) {
            this._instance = new GoogleHelper()
        }
        return this._instance
    }

    latLngToPoint(latLng: any) {

        this.checkInitialized();

        const topRight = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getNorthEast());
        const bottomLeft = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getSouthWest());
        const scale = Math.pow(2, this._map.getZoom());
        const worldPoint = this._map.getProjection().fromLatLngToPoint(latLng);
        return new this.google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    }

    pointToLatLng(point: any) {

        this.checkInitialized();

        const topRight = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getNorthEast());
        const bottomLeft = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getSouthWest());
        const scale = Math.pow(2, this._map.getZoom());
        const worldPoint = new this.google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
        return this._map.getProjection().fromPointToLatLng(worldPoint);
    }

    arePositionsClose(latLng1: any, latLng2: any, rangePx: number): boolean {
        const dist = this.distInScreen(latLng1, latLng2);
        return dist <= rangePx;
    }

    distInScreen(latLng1: any, latLng2: any): number {
        const point1 = this.latLngToPoint(latLng1),
            point2 = this.latLngToPoint(latLng2);

        return  Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
    }


    private checkInitialized() {
        if (!this._google || !this._map) {
            throw new Error('Function initialize must be called with params "google, map" first!');
        }
    }

    generateLatLng(lat: number, lng: number): any {
        return new this._google.maps.LatLng(lat, lng);
    }

    generateDrawingMarker(lat: number, lng: number, isActive: boolean): any {
        const pos = this.generateLatLng(lat, lng);
        return new GoogleHelper.instance.google.maps.Marker({
            map: this._map,
            position: pos,
            icon: GoogleHelper.generateCircleIconByActiveState(isActive),
            draggable: true,
        });
    }

    static generateCircleIconByActiveState(isActive: boolean) {
        const color = isActive ? this.activeColor : this.drawingColor;
        return this.generateCircleIcon(color);
    }

    private static generateCircleIcon(color: string) {
        return {
            path: 'M -8,0 A 8,8 0 0 1 0,-8 8,8 0 0 1 8,0 8,8 0 0 1 0,8 8,8 0 0 1 -8,0 Z',
            fillOpacity: 0,
            anchor: new GoogleHelper.instance.google.maps.Point(0, 0),
            strokeColor: color,
            strokeWeight: 3,
            scale: 1
        };
    }

    private static activeColor = '#FFA500';
    private static drawingColor = '#FFFF00';

    static drawingLineOptions = {
        strokeColor: GoogleHelper.drawingColor,
        strokeOpacity: 1.0,
        strokeWeight: 2
    };

    public generatePolyline(setMap: boolean): any {
        const line = new this._google.maps.Polyline(GoogleHelper.drawingLineOptions)
        if (setMap) {
            line.setMap(this._map)
        }
        return line;
    }


}
