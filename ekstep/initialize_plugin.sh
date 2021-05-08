#!/bin/bash

plugin=$1
variant=$2
repo_name=$3
base_dir=$4
build_type=$5 # prod/staging

available_variants=(forwater diksha)

is_variant_valid ()
{
	flag=1

	for i in ${available_variants[*]}
	do
		if [ $variant == $i ]
		then
			flag=0
			break
		fi
	done

	return $flag
}

initialize_plugin () {
	devmgmt_dir="${base_dir}/devmgmtV2/"
	plugins_root_dir="${base_dir}/appServer/plugins"
	plugin_repo_dir="${plugins_root_dir}/${repo_name}"
	plugin_dir="${plugins_root_dir}/${plugin}"

	nginx_dir="${base_dir}/rootfs_overlay/etc/nginx/sites-enabled/"
	syncthing_dir="${base_dir}/rootfs_overlay/root/.config/syncthing/"

	cd $plugins_root_dir

	mv $repo_name/$plugin .
	rm -rf $repo_name

	cd $plugin_dir
	cp -r config/$variant/* .
	cp $build_type.config.js config.js
	rm *.config.js
	rm $devmgmt_dir/config.js
	cp $plugin_dir/config.js $devmgmt_dir/config.js
	cp nginx/opencdn_nginx $nginx_dir
	cp syncthing/config.xml $syncthing_dir
	cp config/$variant/$variant.apk ${base_dir}/rootfs_overlay/var/www/html/public/app.apk
}

is_variant_valid

if [ $? -eq 0 ]
then
	initialize_plugin
else
	echo "Invalid variant, choose one among: "
	echo ${available_variants[*]}
fi
