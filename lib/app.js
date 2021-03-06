import App from "#core/app";
import config from "#lib/app.config";
import File from "#core/file";

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
            .get( "/cache", this.#cache.bind( this ) )
            .get( "/headers", this.#headers.bind( this ) )
            .get( "/ip", this.#ip.bind( this ) )
            .get( "/user-agent", this.#userAgent.bind( this ) );
    }

    // private
    async #cache ( req ) {
        console.log( req.headers + "" );

        const args = req.headers.get( "x-args" ) ? JSON.parse( req.headers.get( "x-args" ) ) : {};

        const headers = { ...( args.headers || {} ) };

        headers["content-type"] ||= "application/json";
        headers["last-modified"] ||= new Date().toUTCString();

        const content = {
            "args": args,
            "request_headers": req.headers,
            "response_headers": headers,
        };

        if ( args.size ) content.body = "a".repeat( args.size );

        req.end( {
            "compress": args.compress,
            headers,
            "body": new File( {
                "content": JSON.stringify( content, null, 4 ),
            } ),
        } );
    }

    #headers ( req ) {
        req.end( {
            "status": 200,
            "heders": { "Content-Type": "application/json" },
            "body": JSON.stringify( req.headers, null, 4 ),
        } );
    }

    #ip ( req ) {
        req.end( {
            "status": 200,
            "heders": { "Content-Type": "text/plain" },
            "body": req.realRemoteAddress.toString(),
        } );
    }

    #userAgent ( req ) {
        req.end( {
            "status": 200,
            "heders": { "Content-Type": "text/plain" },
            "body": req.headers.get( "user-agent" ),
        } );
    }
}
