module.exports = {
    /*
        core openrap config
    */

   "FS_ROOT": "/home/admin/",
	"username": "brandonStark",
	"password": "theBuilder",
	"serverIP": "35.198.199.222",
	"telemetryAPI": {
		"init": "http://35.198.199.222:8888/api/auth/v1/init", // Authenticates user and returns a token
		"hello": "http://35.198.199.222:8000/api/auth/v1/hello", // Checks if the user is authenticated
		"upload": "http://35.198.199.222:8000/api/auth/v1/telemetry/couchbase" // Load telemetry
	},
	"keyFile": "/etc/telemetry_key",

   /*
       plugin specific config
   */

    "plugin_name": "diksha",
    "root_dir": "/home/admin/diksha/",
    "BASE_URL": "http://localhost:9090",
    "cdn_url": "http://www.openrap.com",
    "app_pages": "./app_pages/",
    "ecar_dir": "/home/admin/diksha/ecar_files/",
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
            "url": "https://diksha.gov.in/api/data/v1/telemetry",
            "token": ""
        },
        "app_register_api": {
            "url": "https://diksha.gov.in/api/api-manager/v1/consumer/mobile_app_openrap/credential/register",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZjg5NGZhOTAzY2M0NWU3ODc2NzdkNTdhMmJjZDY1NyJ9.j6PENpl5brIYYRoSf7kHI9JCHxQit-4_eKXJkBR_OVM"
        },
        "device_register_api": {
            "url": "https://diksha.gov.in/api/api-manager/v1/consumer/mobile_device_openrap/credential/register",
            "token": ""
        }
    },
    "cloud": {
        "search_api": {
			"url": "https://diksha.gov.in/api/composite/v1/search",
			"auth_token": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdW5iaXJkLTUzMjhkMWFkMTE1ODNjMGM5OTRkM2M4MDY3MDdmMjYwODhkN2Q2MDkifQ.XKRvs1BCSeutDIc8VGuxq_v_JX0Z3flWbnmOhxVHEVU",
			"user_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1WXhXdE4tZzRfMld5MG5PS1ZoaE5hU0gtM2lSSjdXU25ibFlwVVU0TFRrIn0.eyJqdGkiOiJjMDc0ODgxYi01OGYxLTQ2YzAtYWUwZC1hNTkwZGVkZWRhMTUiLCJleHAiOjE1MzYzNDc0MzcsIm5iZiI6MCwiaWF0IjoxNTM2MzA0MjM3LCJpc3MiOiJodHRwczovL3N0YWdpbmcub3Blbi1zdW5iaXJkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWRtaW4tY2xpIiwic3ViIjoiNWJkODIwYTItNTk5Zi00ZDEyLTliYzQtZjg3YTg5MjU2ZGU2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWRtaW4tY2xpIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiYTZlNjZjOTMtNjliYS00NmM3LWJkMzAtMDE2MzAxOGQ3ZGI5IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6W10sInJlc291cmNlX2FjY2VzcyI6e30sIm5hbWUiOiLgrobgrprgrr_grrDgrr_grq_grrDgr40iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjb250ZW50Y3JlYXRvcmp1bmVvcmdAc3VuYmlyZC1zdGFnaW5nIiwiZ2l2ZW5fbmFtZSI6IuCuhuCumuCuv-CusOCuv-Cur-CusOCvjSIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJjb250ZW50Y3JlYXRvckBqdW5lb3JnLmNvbSJ9.RIDIsVXvTY5UPibUYxaQKtS5ARhwPFPDYsJw_n2Xe5u_xJuxkTCCceO8ECojnt-9WRrDhUwQm7kiAK0h-4LFcqOrDwsXmh09xvAQ_FNcTbeRL0Rg_Qj1rQgNHE9M7tmZx1LZUe8FzDwxFhaQaeQ-wb9-o4wuAGjt5AuNQy6ffmS29iZlpuxLoJGy89b61Cytm-h_GAGfG9qmqIPQ_HIfT0XiEyuuHXS-A4Kiii5qDusTlb78mJRGbQ_BOBlRNmmCpVBUVyJ-AwjJyg7RHaHz9uHn0iRvh-BHH9xSfpxLSZxlkLCilJ048uLqjEwMGc35RqIspazW19cAa4XPwEO4Mg"
		},
		"app_register_api": {
            "url": "https://diksha.gov.in/api/api-manager/v1/consumer/mobile_app_openrap/credential/register",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZjg5NGZhOTAzY2M0NWU3ODc2NzdkNTdhMmJjZDY1NyJ9.j6PENpl5brIYYRoSf7kHI9JCHxQit-4_eKXJkBR_OVM"
        },
        "device_register_api": {
            "url": "https://diksha.gov.in/api/api-manager/v1/consumer/mobile_device_openrap/credential/register",
            "token": ""
        },
		"filter": {
			"keysToUse": [
				"subject",
				"downloadUrl",
				"language",
				"appIcon",
				"gradeLevel",
				"contentType",
				"identifier",
				"size",
				"lastPublishedOn",
				"name",
				"status",
				"description",
				"creator",
				"pkgVersion"
			]
		}
    }
}
