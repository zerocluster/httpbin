import App from "#core/app";
import File from "#core/file";
import { sleep } from "#core/utils";

export default class extends App {

    // propeties
    get location () {
        return import.meta.url;
    }

    // protected
    async _init () {
        this.publicHttpServer //
            .get( "/cache", this.#cache.bind( this ) )
            .get( "/headers", this.#headers.bind( this ) )
            .get( "/ip", this.#ip.bind( this ) )
            .get( "/user-agent", this.#userAgent.bind( this ) )
            .get( "/delay", this.#delay.bind( this ) )
            .get( "/redirect", this.#redirect.bind( this ) );

        return result( 200 );
    }

    async _start () {
        return result( 200 );
    }

    // private
    async #cache ( req ) {
        console.log( req.headers + "" );

        const args = req.headers.get( "x-args" ) ? JSON.parse( req.headers.get( "x-args" ) ) : {};

        const headers = { ...( args.headers || {} ) };

        headers[ "content-type" ] ||= "application/json";
        headers[ "last-modified" ] ||= new Date().toUTCString();

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
                "buffer": JSON.stringify( content, null, 4 ),
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

    async #delay ( req ) {
        const timeout = +req.url?.searchParams.get( "timeout" ) || 1000;

        await sleep( timeout );

        req.end();
    }

    async #redirect ( req ) {
        var count = +( req.url?.searchParams.get( "count" ) || 1 );

        if ( count > 0 ) {
            req.end( {
                "status": 307,
                "headers": {
                    "location": "/redirect?count=" + --count,
                    "set-cookie": `redirect-${ count }=` + new Date().toISOString(),
                },
            } );
        }
        else {
            req.end( {
                "status": 200,
                "headers": {
                    "set-cookie": "redirect-done=" + new Date().toISOString(),
                },
            } );
        }
    }
}
