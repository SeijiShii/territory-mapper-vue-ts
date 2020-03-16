import MapLine from "@/models/MapLine";
import MapPoint from "@/models/MapPoint";
import GoogleHelper from "@/utils/GoogleHelper";

export default class MapLineList {

    private static _instance: MapLineList;

    private constructor() {
        //
    }

    public static get instance(): MapLineList {
        if (!this._instance) {
            this._instance = new MapLineList();
        }

        return this._instance;
    }

    private list: MapLine[] = [];

    public add(line: MapLine){
        this.list.push(line);
    }


    getMapPointByPosition(latLng: any, rangePx: number): MapPoint | null {

        for (let i = 0 ; i < this.list.length ; i++ ) {
            const line = this.list[i];

            const distToStart = GoogleHelper.instance.distInScreen(latLng, line.start.latLng);
            const distToEnd = GoogleHelper.instance.distInScreen(latLng, line.end.latLng);

            if (distToStart <= rangePx && distToEnd <= rangePx) {
                if (distToStart < distToEnd) {
                    return line.start
                } else {
                    return line.end
                }
            } else if (distToStart <= rangePx) {
                return line.start
            } else if (distToEnd <= rangePx) {
                return line.end
            }
        }
        return null
    }

    getLinesByPoint(point: MapPoint): MapLine[] {

        const lines: MapLine[] = [];

        this.list.forEach((line) => {
            if (line.start === point || line.end === point) {
                lines.push(line);
            }
        });
        return lines;
    }

    getConnectedLine(line: MapLine, point: MapPoint): MapLine | null {
        for (let i = 0 ; i < this.list.length ; i++) {
            const line2 = this.list[i];

            if (line2 === line) {
                continue;
            }

            if (line2.start === point || line2.end === point) {
                return line2;
            }
        }
        return null;
    }

}
