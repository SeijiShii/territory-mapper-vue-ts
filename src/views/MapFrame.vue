<template>
    <div class="map-outer-frame">
        <GoogleMap class="google-map-frame"
            v-on:on-google-map-mounted="onGoogleMapMounted"
            v-on:on-click-map="onClickOnGoogleMap"
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
    import vuetify from "@/plugins/vuetify";

    @Component({components: {GoogleMap}})
    export default class MapFrame extends Vue{

        google: any = null;
        isDrawing = false;
        outerFrame: any = null;
        googleMapFrame: any = null;

        mounted() {

            this.outerFrame = this.$el.querySelector('.outer-frame');
            this.googleMapFrame = this.$el.querySelector('.google-map-frame');

            window.addEventListener('resize', this.refreshMapFrameSize);

            this.refreshMapFrameSize()
        }

        onGoogleMapMounted(google: any) {
            this.google = google;
        }





        onClickOnGoogleMap(map: any, ev: any) {
            //
        }

        onMoveInGoogleMap(map: any, ev: any) {

            if (this.isDrawing) {
                this.drawCoordinateLines(map, ev.latLng)
            }

        }

        onClickDrawButton() {
            this.isDrawing = !this.isDrawing;

            if (!this.isDrawing) {
                this.clearActiveUIs();
            }
        }

        clearActiveUIs() {
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

        get drawButtonIcon() {
            if (this.isDrawing) {
                return 'mdi-close-octagon-outline';
            } else {
                return 'mdi-draw';
            }
        }

        refreshMapFrameSize() {
            const frameWidth = document.body.clientWidth - 50;
            this.googleMapFrame.style.width = frameWidth + 'px';
        }

        activeColor = '#FFA500';



        coordinateLineOptions = {
            strokeColor: this.activeColor,
            strokeOpacity: 1.0,
            strokeWeight: 1
        };

        verticalLine: any = null;
        horizontalLine: any = null;
        activeMarker: any = null;
        activeIcon: any = null;

        drawCoordinateLines(map: any, latLng: any) {

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
            }
            this.activeMarker.setPosition(latLng);
        }

        generateCircleIcon(color: string) {
            return {
                path: 'M 86.93452,96.672615 A 13.607142,13.607142 0 0 1 73.327377,110.27976 13.607142,13.607142 0 0 1 59.720235,96.672615 13.607142,13.607142 0 0 1 73.327377,83.065473 13.607142,13.607142 0 0 1 86.93452,96.672615 Z',
                // fillColor: color,
                fillOpacity: 0,
                anchor: new this.google.maps.Point(74,97),
                strokeColor: color,
                strokeWeight: 3,
                scale: 1
            };
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
