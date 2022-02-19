import App from "#core/app";
import config from "#lib/app.config";

export default class extends App {
    constructor () {
        super( import.meta.url, config );
    }

    // static
    static cli () {
        return {
            "options": {},
            "arguments": {},
        };
    }

    // protected
    _initThreads () {
        return {
            "worker": {
                "num": 1,
                "path": new URL( "./threads/worker.js", import.meta.url ),
                "arguments": null,
            },
        };
    }

    _initPrivateHttpServer ( server ) {}

    _initPublicHttpServer ( server ) {
        server //
            .get( "/ip", this.#ip.bind( this ) )
            .get( "/headers", this.#headers.bind( this ) );
    }

    // private
    #ip ( req ) {
        const addr = req.realRemoteAddr;

        req.end( addr.toString() );
    }

    #headers ( req ) {
        const headers = req.headers;

        req.end( JSON.stringify( headers, null, 4 ) );
    }
}
