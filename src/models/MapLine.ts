import MapPoint from "@/models/MapPoint";

export default class MapLine {

    constructor(public start: MapPoint, public end: MapPoint, public line: any) {
    }

    public refresh() {
        this.line.setPath([this.start.latLng, this.end.latLng])
    }


}
