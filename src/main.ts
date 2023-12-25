import './index.css'
import { tableFromIPC } from "apache-arrow";
import MapLibreGL from 'maplibre-gl';
import Alpine from 'alpinejs';


async function query(queryStr: string): Promise<string> {
  try {
    const response = await fetch("/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({query: queryStr}),
      });

      const table = await tableFromIPC(response);
      console.log(table.schema)
      console.table(table.toArray());
  } catch (error) {
    console.error("Error:", error);
  }
  return ""
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