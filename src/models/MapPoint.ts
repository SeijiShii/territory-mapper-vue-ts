import StringUtils from "@/utils/StringUtils";

export default class MapPoint {
    lat = 0;
    lng = 0;
    id: string = StringUtils.generateId('map_point');
}

