/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const https = require( 'https' );

/**
 * Internal dependencies
 */
const { CURRENT_RELEASE } = require( './constants' );

function releasePath( addPath = '' ) {
	return path.resolve(
		__dirname,
		'..',
		'releases',
		CURRENT_RELEASE,
		addPath
	);
}

async function downloadFile( url, destPath ) {
	const tempPath = destPath + '.tmp';
	const directoryPath = path.dirname( destPath );
	fs.mkdirSync( directoryPath, { recursive: true } );

	return new Promise( ( resolve, reject ) => {
		const file = fs.createWriteStream( tempPath );
		https
			.get( url, function ( response ) {
				response.pipe( file );
				// move temp file to destPath
				file.on( 'close', function () {
					fs.renameSync( tempPath, destPath );
					resolve();
				} );
			} )
			.on( 'error', function ( err ) {
				// Handle errors
				fs.unlink( tempPath ); // Delete the file async. (But we don't check the result)
				reject( err.message );
			} );
	} );
}

function stringify( data ) {
	return (
		JSON.stringify( data, null, '\t' )
			// make single element arrays to take only one line
			.replace( /\[\n\t+(".*?")\n\t+\]/g, '[ $1 ]' )
	);
}

module.exports = {
	releasePath,
	downloadFile,
	stringify,
};
