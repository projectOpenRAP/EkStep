module.exports = {
    "plugin_name": "forwater",
    "root_dir": "/home/admin/forwater/",
    "BASE_URL": "http://localhost:9090",
    "cdn_url": "http://www.openrap.com",
    "app_pages": "./app_pages",
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
            "url": "https://staginglms.forwater.in/api/data/v1/telemetry",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyMDUxMjFkZTI5NzQ0MzM4YTQzZDJlYTVjMjA4YzY5NCJ9.O1L7QUFK2PUbD-bJ-sj7mKsr23jdp4kWA0PBIaWXBIo"
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
