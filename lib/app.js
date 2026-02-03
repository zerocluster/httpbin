import "#core/temporal";
import App from "#core/app";
import Blob from "#core/blob";
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
            .any( "/redirect", this.#redirect.bind( this ) )
            .post( "/post", this.#post.bind( this ) );

        return result( 200 );
    }

    async _start () {
        return result( 200 );
    }

    // private
    async #cache ( req ) {
        console.log( req.headers + "" );

        const args = req.headers.get( "x-args" )
            ? JSON.parse( req.headers.get( "x-args" ) )
            : {};

        const headers = { ...args.headers };

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
            "body": new Blob( [ JSON.stringify( content, null, 4 ) ] ),
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
            "body": req.remoteAddress.toString(),
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
        var count = +( req.url.searchParams.get( "count" ) || 1 ),
            status = +( req.url.searchParams.get( "status" ) || 307 );

        if ( req.hasBody ) await req.body.blackhole();

        if ( count > 0 ) {
            req.end( {
                status,
                "headers": {
                    "location": `/redirect?count=${ --count }&status=${ status }`,
                    "set-cookie": {
                        "name": `redirect-${ count }`,
                        "value": new Date().toISOString(),
                        "expires": Temporal.Now.instant().add( { "hours": 1 } ),
                        "maxAge": 60,
                    },
                },
            } );
        }
        else {
            req.end( {
                "status": 200,
                "headers": {
                    "set-cookie": {
                        "name": "redirect-done",
                        "value": new Date().toISOString(),
                        "maxAge": 10_000,
                        "expires": Temporal.Now.instant().add( { "hours": 1 } ),
                    },
                },
                "body": new Date() + "",
            } );
        }
    }

    async #post ( req ) {
        await req.body.blackhole();

        return this.#headers( req );
    }
}
