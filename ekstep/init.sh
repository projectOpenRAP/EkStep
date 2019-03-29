plugin=$1
git_repo=$2
build_dir=$3
variant=$4
type=$5

devmgmt_dir="${build_dir}/devmgmtV2/"
plugin_dir="${build_dir}/appServer/plugins/${plugin}"
nginx_dir="${build_dir}/rootfs_overlay/etc/nginx/sites-enabled/"
syncthing_dir="${build_dir}/rootfs_overlay/root/.config/syncthing/"

git clone $git_repo $build_dir/tmp
cd $build_dir/tmp
git checkout develop && git pull

cd $build_dir
mv tmp/$plugin ../
rm -rf tmp

cd $plugin_dir
cp -r config/$variant/* .
cp $type.config.js config.js
rm *.config.js
rm $devmgmt_dir/config.js
cp $plugin_dir/config.js $devmgmt_dir/config.js
cp nginx/opencdn_nginx $nginx_dir
cp syncthing/config.xml $syncthing_dir