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
            .get( "/headers", this.#headers.bind( this ) )
            .get( "/user-agent", this.#userAgent.bind( this ) );
    }

    // private
    #ip ( req ) {
        req.writeHead( 200, { "Content-Type": "text/plain" } ) //
            .end( req.realRemoteAddress.toString() );
    }

    #headers ( req ) {
        req.writeHead( 200, { "Content-Type": "application/json" } ) //
            .end( JSON.stringify( req.headers, null, 4 ) );
    }

    #userAgent ( req ) {
        req.writeHead( 200, { "Content-Type": "text/plain" } ) //
            .end( req.headers.get( "user-agent" ) );
    }
}
