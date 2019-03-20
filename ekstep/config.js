/*
    This is a template. Replace it with your configurations.
*/

module.exports = {
    
    /*
        core openrap config
    */

    "FS_ROOT": "",
    "username": "",
    "password": "",
    "serverIP": "",
    "telemetryAPI": {
        "init": "", // Authenticates user and returns a token
        "hello": "", // Checks if the user is authenticated
        "upload": "" // Load telemetry
    },
    "keyFile": "",

    /*
        plugin specific config
    */

    "plugin_name": "",
    "root_dir": "",
    "BASE_URL": "",
    "cdn_url": "",
    "app_pages": "",
    "ecar_dir": "",
    "meta_data_dir": "",
    "content_dir": "",
    "content_url": "",
    "bleve_search": {
        "db_name": "",
        "db_dir": ""
    },
    "syncthing": {
        "sync_dir": "",
        "marker_file": "",
        "xml_config": {
            "src_dir": "",
            "dest_dir": ""
        }
    },
    "telemetry": {
        "src_dir": "",
        "log_file": "",
        "sync_api": {
            "url": "",
            "token": ""
        },
        "app_register_api": {
            "url": "",
            "token": ""
        },
        "device_register_api": {
            "url": "",
            "token": ""
        }
    },
    "cloud": {
        "search_api": {
			"url": "",
			"auth_token": "",
			"user_token": ""
		},
		"app_register_api": {
            "url": "",
            "token": ""
        },
        "device_register_api": {
            "url": "",
            "token": ""
        },
		"filter": {}
    }
}
