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
            .get( "/cache", this.#cached.bind( this ) )
            .post( "/cache", this.#cached.bind( this ) )
            .get( "/headers", this.#headers.bind( this ) )
            .get( "/ip", this.#ip.bind( this ) )
            .get( "/user-agent", this.#userAgent.bind( this ) );
    }

    // private
    async #cached ( req ) {
        const args = req.method === "post" ? await req.json() : {};

        const headers = {
            "last-modified": new Date().toISOString(),
        };

        if ( args["cache-control"] ) headers["cache-control"] = args["cache-control"];
        if ( args["x-accel-expires"] ) headers["x-accel-expires"] = args["x-accel-expires"];

        var content = `
request parameters:
${JSON.stringify( args, null, 4 )}

request headers:
${req.headers.toString()}

response headers:
${JSON.stringify( headers, null, 4 )}
`;

        if ( args.size ) content += `\r\n` + "a".repeat( args.size );

        req.end( {
            "compress": args.compress,
            headers,
            "body": new File( {
                "type": "text/plain",
                content,
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
