<template>
    <div class="map-outer-frame">
        <div id="googleMap" :style="`height:${height}`"></div>
        <template v-if="google && map">
            <slot :google="google" :map="map" />
        </template>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator'
    import qs from 'query-string'

    const params = {
        // https://stackoverflow.com/questions/50828904/using-environment-variables-with-vue-js
        // 環境変数の読み込み
        key: process.env.VUE_APP_GOOGLE_MAP_API_KEY,
        libraries: 'geometry,drawing,places',
        callback: 'handleLoadGoogleMapsScript'
    };

    interface GoogleMapWindow extends Window {
        handleLoadGoogleMapsScript: Function;
        google: any;
    }

    declare const window: GoogleMapWindow;

    @Component
    export default class GoogleMap extends Vue {
        @Prop() private zoom!: number;
        @Prop() private center!: { lat: number; lng: number };
        @Prop({ default: '100%' }) private height!: string;

        google: any = null;
        map: any = null;

        mounted() {

            this.loadGoogleMapsScript().then(google => {
                this.google = google;
                this.initializeMap()
            })
        }

        loadGoogleMapsScript() {
            return new Promise((resolve, reject) => {
                if (window.google) {
                    return resolve(window.google)
                }
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?${qs.stringify(
                    params
                )}`;
                const head = document.querySelector('head');
                if (!head) return reject(new Error('head node is undefined'));
                head.appendChild(script);
                window.handleLoadGoogleMapsScript = () => {
                    resolve(window.google)
                };
                setTimeout(() => {
                    if (!window.google) {
                        reject(new Error('failed load google api'))
                    }
                }, 5000)
            })
        }

        initializeMap() {
            const mapContainer = this.$el.querySelector('#googleMap');
            const { Map, MapTypeId } = this.google.maps;
            this.map = new Map(mapContainer, {
                zoom: this.zoom,
                center: this.center,
                mapTypeId: MapTypeId.HYBRID,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            });

            this.google.maps.event.addListener(this.map, 'click', this.onClickOnMap);
            this.google.maps.event.addListener(this.map, 'mousemove', this.onMoveInMap);
        }

        onClickOnMap(ev: any) {
            this.$emit('on-click-map', this.map, ev, this.latLngToPoint(ev.latLng, this.map));
        }

        onMoveInMap(ev: any) {
            this.$emit('on-mousemove-in-map', this.map, ev, this.latLngToPoint(ev.latLng, this.map));
        }

        latLngToPoint(latLng: any, map: any) {
            const topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
            const bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
            const scale = Math.pow(2, map.getZoom());
            const worldPoint = map.getProjection().fromLatLngToPoint(latLng);
            return new this.google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
        }

        pointToLatLng(point: any, map: any) {
            const topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
            const bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
            const scale = Math.pow(2, map.getZoom());
            const worldPoint = new this.google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
            return map.getProjection().fromPointToLatLng(worldPoint);
        }
    }
</script>

<style lang="scss">
    .map-outer-frame {
        height: 100%;
    }
</style>
