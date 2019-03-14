module.exports = {
    "plugin_name": "forwater",
    "root_dir": "/home/admin/forwater/",
    "BASE_URL": "http://localhost:9090",
    "cdn_url": "http://www.openrap.com",
    "app_pages": "",
    "ecar_dir": "/home/admin/forwater/ecar_files",
    "meta_data_dir": "/home/admin/forwater/json_dir/",
    "content_dir": "/home/admin/forwater/xcontent/",
    "content_url": "http://www.openrap.com/ecar_files/",
    "bleve_search": {
        "db_name": "fw.db",
        "db_dir": ""
    },
    "syncthing": {
        "sync_dir": "/home/admin/forwater/",
        "marker_file": ".stfolder",
        "xml_config": {
            "src_dir": "./syncthing/",
            "dest_dir": "/root/.config/syncthing/"
        }
    },
    "telemetry": {
        "src_dir": "/home/admin/forwater/telemetry/",
        "log_file": "/tmp/telemetry_upload.log",
        "sync_api": {
            "url": "",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0NTAyNmQ0M2RhMWM0Yzc1OWMwNTNkZDA3OWJlMDkwMSJ9.bQ2Gie8C9eO7E-pcB0iICmf5uww2IuM8YgqR8ohZfTg"
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
        "endpoint1": "",
        "endpoint2": "",
        "endpoint3": "",
        "finalToken": ""
    }
}