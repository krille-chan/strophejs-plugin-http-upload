/*
This programm is free software under CC creative common licence!
Author: Christian Pauly
*/

/**
* Messaging Plugin for strophe.js
*
*/

httpUploadService = "";

(function () {

	Strophe.addConnectionPlugin('httpupload', {
		_connection: null,

		init: function (conn) {
			this._connection = conn;
			Strophe.addNamespace('HTTP-UPLOAD', 'urn:xmpp:http:upload:0');
		},


		discover: function ( success_callback, error_callback ) {
			var req=$iq({
				"type": "get",
				"from": this._connection.jid,
				"to": Strophe.getDomainFromJid ( this._connection.jid ),
				"id": this._connection.getUniqueId()})
				.c("query", {
					"xmlns":"http://jabber.org/protocol/disco#items"
				});

			this._connection.sendIQ( req, function ( iq ) {
				var ansNodes = iq.querySelectorAll("item");
				httpUploadService = "";
				for ( i=0; i<ansNodes.length; i++ ) {
					var jid = ansNodes[i].getAttribute ( "jid" );
					if( jid.indexOf( "upload" ) !== -1 ) {
						httpUploadService = jid;
					}
				}
				success_callback ( httpUploadService );
			}, error_callback);
		},


		upload: function ( file, success_callback, error_callback ) {
			if ( httpUploadService == "")
				return error_callback ( "You need to discover the service first!" );

			var req=$iq({
				"type": "get",
				"from": this._connection.jid,
				"to": httpUploadService,
				"id": this._connection.getUniqueId()})
				.c("request", {
					"xmlns": "urn:xmpp:http:upload",
					"filename": file.name,
					"size": file.size,
					"content-type": file.type
				}).c("filename").t(file.name).up()
				.c("size").t(file.size).up()
				.c("content-type").t(file.type).up();

			this._connection.sendIQ( req, function ( iq ) {
				try {
					var put = iq.querySelector( "put" ).innerHTML;
					var get = iq.querySelector( "get" ).innerHTML;
					xhr = new XMLHttpRequest();

					xhr.onreadystatechange = function() {
				        if (xhr.readyState === 4) {
				        	success_callback(get);	console.log(get);
				        }
					};
					xhr.open("PUT", put, true);
					xhr.setRequestHeader('Content-Type', 'text/plain');
					xhr.send(file);
				}
				catch ( e ) {
					error_callback ( e );
				}
			}, error_callback);
		},


	});

})();
