import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';
// import {Query} from '../wailsjs/go/main/App';
import MapLibreGL from 'maplibre-gl';
import Alpine from 'alpinejs';

declare global {
    interface Window {
        Alpine: any;
    }
}
window.Alpine = Alpine

import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_next,
        // mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
        mainWorker: eh_worker
    },
};

// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
// Instantiate the asynchronus version of DuckDB-wasm
const worker = new Worker(bundle.mainWorker as string);
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
const conn = await db.connect(); // Connect to db



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
        let r = await conn.query(`install spatial;
        load spatial;`);
        console.log("load spatial:", r);

    },
    async runQuery() {
        if (this.query === "") return;
        this.results = (await conn.query(this.query)).toString();
    },
    async handleFileSelect(evt: any) {
        console.log(evt);
        var files = evt.target.files; // FileList object

        for (var i = 0, f; f = files[i]; i++) {
            console.log(f);
            await db.registerFileHandle(f.name, f, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
        }
    }
}));


Alpine.start()

// // Closing everything
// await conn.close();
// await db.terminate();
// await worker.terminate();
