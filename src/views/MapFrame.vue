<template>
    <div class="map-outer-frame">
        <GoogleMap class="google-map-frame"
            v-on:on-google-map-mounted="onGoogleMapMounted"
            v-on:on-click-map="onClickOnGoogleMap"
            v-on:on-right-click-map="onRightClickMap"
            v-on:on-mousemove-in-map="onMoveInGoogleMap"
            :zoom="17"
            :center="{lat: 36.773981, lng: 140.725157}"/>

        <div class="side-panel">
            <v-btn text
                   small
                   height="40"
                   @click="onClickDrawButton">
                <v-icon>{{ drawButtonIcon }}</v-icon>
            </v-btn>
        </div>

    </div>
</template>

<script lang="ts">

    import { Component, Vue, Prop } from 'vue-property-decorator'
    import GoogleMap from "@/views/GoogleMap.vue";
    import MapPoint from "@/models/MapPoint";

    @Component({components: {GoogleMap}})
    export default class MapFrame extends Vue{

        private google: any = null;
        private isDrawing = false;
        private outerFrame: any = null;
        private googleMapFrame: any = null;

        mounted() {

            this.outerFrame = this.$el.querySelector('.outer-frame');
            this.googleMapFrame = this.$el.querySelector('.google-map-frame');

            window.addEventListener('resize', this.refreshMapFrameSize);

            this.refreshMapFrameSize()
        }

        private onGoogleMapMounted(google: any) {
            this.google = google;
        }

        private onClickOnGoogleMap(map: any, ev: any) {
            //

            if (this.isDrawing) {
                this.addMapPoint(map, ev.latLng);
            }
        }

        private onRightClickMap(map: any, ev: any) {
            this.isDrawing = false;
            this.clearActiveUIs();
        }

        private onMoveInGoogleMap(map: any, ev: any) {

            if (this.isDrawing) {
                this.drawCoordinateLines(map, ev.latLng)
            }

        }

        private onClickDrawButton() {
            this.isDrawing = !this.isDrawing;

            if (!this.isDrawing) {
                this.clearActiveUIs();
            }
        }

        private clearActiveUIs() {
            if (this.horizontalLine) {
                this.horizontalLine.setMap(null);
                this.horizontalLine = null;
            }

            if (this.verticalLine) {
                this.verticalLine.setMap(null);
                this.verticalLine = null
            }

            if (this.activeMarker) {
                this.activeMarker.setMap(null);
                this.activeMarker = null;
            }
        }

        private get drawButtonIcon() {
            if (this.isDrawing) {
                return 'mdi-close-octagon-outline';
            } else {
                return 'mdi-draw';
            }
        }

        private refreshMapFrameSize() {
            const frameWidth = document.body.clientWidth - 50;
            this.googleMapFrame.style.width = frameWidth + 'px';
        }

        private activeColor = '#FFA500';
        private inactiveColor = '#FFFF00';

        private coordinateLineOptions = {
            strokeColor: this.activeColor,
            strokeOpacity: 1.0,
            strokeWeight: 1
        };

        private verticalLine: any = null;
        private horizontalLine: any = null;
        private activeMarker: any = null;
        private activeIcon: any = null;

        private drawCoordinateLines(map: any, latLng: any) {

            const x = latLng.lat(),
                y = latLng.lng();

            if (this.verticalLine) {
                this.verticalLine.setMap(null);
            } else {
                this.verticalLine = new this.google.maps.Polyline(this.coordinateLineOptions);
            }

            this.verticalLine.setPath([{lat: -90, lng: y}, {lat: 0, lng: y}, {lat: 90, lng: y}]);
            this.verticalLine.setMap(map);

            if (this.horizontalLine) {
                this.horizontalLine.setMap(null);

            } else {
                this.horizontalLine = new this.google.maps.Polyline(this.coordinateLineOptions);

            }

            this.horizontalLine.setPath([{lat: x, lng: -180}, {lat: x, lng: 0}, {lat: x, lng: 180}]);
            this.horizontalLine.setMap(map);

            if (!this.activeIcon) {
                this.activeIcon = this.generateCircleIcon(this.activeColor);
            }

            if (!this.activeMarker) {
                this.activeMarker = new this.google.maps.Marker({
                    map: map,
                    icon: this.activeIcon,
                });
                this.activeMarker.addListener('click', () => {
                    this.addMapPoint(map, this.activeMarker.getPosition());
                });
                this.activeMarker.addListener('rightclick', () => {
                    this.isDrawing = false;
                    this.clearActiveUIs();
                });
            }
            this.activeMarker.setPosition(latLng);
        }

        private generateCircleIcon(color: string) {
            return {
                path: 'M -13,0 A 13,13 0 0 1 0,-13 13,13 0 0 1 13,0 13,13 0 0 1 0,13 13,13 0 0 1 -13,0 Z',
                fillOpacity: 0,
                anchor: new this.google.maps.Point(0, 0),
                strokeColor: color,
                strokeWeight: 3,
                scale: 1
            };
        }

        private lastPoint: MapPoint | null = null;

        private refreshDrawingLine(map: any) {
            //
        }

        private addMapPoint(map: any, latLng: any) {

            console.log(MapPoint);

            const point = new MapPoint();
            point.lat = latLng.lat();
            point.lng = latLng.lng();

            const marker = new this.google.maps.Marker({
                map: map,
                position: latLng,
                icon: this.generateCircleIcon(this.inactiveColor),
            });
        }
    }

</script>

<style scoped lang="scss">

    $whiteSmokeTrans: #f5f5f5BB;

    .map-outer-frame {
        position: relative;
        height: 100%;
        width: 100%;

        .google-map-frame {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
        }

        .side-panel {
            top: 0;
            right: 0;
            height: 100%;
            width: 50px;
            position: absolute;
            background: whitesmoke;
        }
    }


</style>
