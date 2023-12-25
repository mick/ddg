import './index.css'
import { invoke } from "@tauri-apps/api/tauri";
import MapLibreGL from 'maplibre-gl';
import Alpine from 'alpinejs';


async function query(queryStr: string): Promise<string> {
    return await invoke("run_query", {
      query: queryStr,
    })
}

Alpine.data('map', () => ({
  map: null as MapLibreGL | null,
  query: "",
  results: "",
  async init() {
      this.map = new MapLibreGL.Map({
          container: 'map',
          style: 'https://api.maptiler.com/maps/basic/style.json?key=FTLuKm74HFFnLGxZlogl',
          center: [0, 0],
          zoom: 0
      });
      this.$refs.query.focus();


  },
  async runQuery() {
      if (this.query === "") return;
      this.results = await query(this.query)
  },
  async handleFileSelect(evt: any) {
      console.log(evt);
      var files = evt.target.files; // FileList object

      for (var i = 0, f; f = files[i]; i++) {
          console.log(f);
      }
  }
}));


Alpine.start()