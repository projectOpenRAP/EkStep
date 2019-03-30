plugin=$1
base_dir=$2
repo_name=$3
variant=$4
type=$5

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
cp $type.config.js config.js
rm *.config.js
rm $devmgmt_dir/config.js
cp $plugin_dir/config.js $devmgmt_dir/config.js
cp nginx/opencdn_nginx $nginx_dir
cp syncthing/config.xml $syncthing_dir