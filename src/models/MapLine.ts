import MapPoint from "@/models/MapPoint";
import PointName from "@/models/PointName";

export default class MapLine {

    constructor(public start: MapPoint, public end: MapPoint, public line: any) {
    }

    public refresh() {
        this.line.setPath([this.start.latLng, this.end.latLng])
    }


    public getMapPoint(latLng: any): MapPoint | null {

        if (latLng === this.start.latLng) {
            return this.start;
        }

        if (latLng === this.end.latLng) {
            return this.end;
        }
        return null;
    }

    public setPoint(pointName: PointName, point: MapPoint) {
        switch (pointName) {
            case PointName.Start:
                this.start = point;
                break;
            case PointName.End:
                this.end = point;
                break;
        }
    }

    public getPointName(point: MapPoint): PointName {
        if (point.latLng.lat() === this.start.latLng.lat()
            && point.latLng.lng() === this.start.latLng.lng()) {
            return PointName.Start;
        } else if (point.latLng.lat() === this.end.latLng.lat()
            && point.latLng.lng() === this.end.latLng.lng()) {
            return PointName.End;
        }
        return PointName.None;
    }

    public getOtherPoint(point: MapPoint): MapPoint | null {

        if (!point.isSamePosition(this.start)
                && !point.isSamePosition(this.end)) {
            return null;
        }

        if (point.isSamePosition(this.start)) {
            return this.end;
        }

        return this.start;
    }


}
