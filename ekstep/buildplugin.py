#!/usr/bin/env python3
import sys, os, subprocess, argparse, shutil, urllib
import logging
import json

def run_cmd(cmd):
    print("cmd: %s" % cmd)
    p = subprocess.Popen(cmd, shell=True, stdout=sys.__stdout__, stderr=subprocess.PIPE)
    (result, error) = p.communicate()
    if p.returncode != 0:
        print(error)
        sys.exit(p.returncode)

def init(base_dir, repo_name, variant="diksha", prod=False):
	plugin_name = "ekstep"
	available_variants = [
		"forwater",
		"diksha"
	]

	build_type = "prod" if prod else "staging"

	if base_dir is not None:
		plugins_root_dir = "{}/appServer/plugins".format(base_dir)
		plugin_repo_dir = "{}/{}".format(plugins_root_dir, repo_name)
		plugin_dir = "{}/{}".format(plugin_repo_dir, plugin_name)

		if variant in available_variants:
			cmd = "{}/init.sh {} {} {} {} {}".format(plugin_dir, plugin_name, base_dir, repo_name, variant, build_type)
			run_cmd(cmd)
		else:
			print(plugin_name + "has the following variants only: " + available_variants)
	else:
		print("Expected the base directory as the first parameter. Got" + base_dir)