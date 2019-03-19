module.exports = {
    "plugin_name": "diksha",
    "root_dir": "/home/admin/diksha/",
    "BASE_URL": "http://localhost:9090",
    "cdn_url": "http://www.openrap.com",
    "app_pages": "./app_pages/",
    "ecar_dir": "/home/admin/diksha/ecar_files",
    "meta_data_dir": "/home/admin/diksha/json_dir/",
    "content_dir": "/home/admin/diksha/xcontent/",
    "content_url": "http://www.openrap.com/ecar_files/",
    "bleve_search": {
        "db_name": "dk.db",
        "db_dir": ""
    },
    "syncthing": {
        "sync_dir": "/home/admin/diksha/",
        "marker_file": ".stfolder",
        "xml_config": {
            "src_dir": "./syncthing/",
            "dest_dir": "/root/.config/syncthing/"
        }
    },
    "telemetry": {
        "src_dir": "/home/admin/diksha/telemetry/",
        "log_file": "/tmp/telemetry_upload.log",
        "sync_api": {
            "url": "https://staging.ntp.net.in/api/data/v1/telemetry",
            "token": ""
        },
        "app_register_api": {
            "url": "https://staging.ntp.net.in/api/api-manager/v1/consumer/mobile_app_openrap/credential/register",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3YWIyMmJkMTNlZTQ0N2Q3YWM4ZmYwYjAxNzhmNjA1MyJ9.RM50L4adtatGwth1aMmxFnsQReOFMbrS1UuQPR1Xdi4"
        },
        "device_register_api": {
            "url": "https://staging.ntp.net.in/api/api-manager/v1/consumer/mobile_device_openrap/credential/register",
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