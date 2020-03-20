import StringUtils from "@/utils/StringUtils";
import GoogleHelper from "@/utils/GoogleHelper";

export default class MapPoint {
    id: string = StringUtils.generateId('map_point');
    onClickMarker: ((point: MapPoint) => void) = () => {
        //
    };
    onDragMarker: ((point: MapPoint, latLng: any) => void) = () => {
        //
    };

    _this = this;

    private _marker: any = null;
    set marker(val: any) {
        this._marker = val;
        this._marker.addListener('click', () => {
            this.onClickMarker(this._this);
        });
        this._marker.addListener('drag', (ev: any) => {
            this.onDragMarker(this._this, ev.latLng);
        })
    }
    get marker(): any {
        return this._marker;
    }



    private _isActive = false;
    set isActive(val: boolean) {
        this._isActive = val;
        const icon = GoogleHelper.generateCircleIconByActiveState(this._isActive);
        this.marker.setIcon(icon);
    }
    get isActive() {
        return this._isActive;
    }

    get latLng() {
        if (!this.marker) {
            throw new Error('Marker is not assigned!')
        }
        return this.marker.position;
    }

}

