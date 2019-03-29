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

def init(plugins_root_dir, variant, prod):
	plugin_name = "ekstep"
	git_repo = "https://github.com/projectOpenRAP/EkStep.git"
	# plugin_build_dir = "{}/{}".format(plugins_root_dir, plugin_name)
	available_variants = [
		"forwater",
		"diksha"
	]

	build_type = "prod" if prod else "staging"

	if plugins_root_dir is not None:
		if variant in available_variants:
			cmd = "chmod +x ./init.sh && ./init.sh {} {} {} {} {}".format(plugin_name, git_repo, plugins_root_dir, variant, build_type)
			run_cmd(cmd)
		else:
			print(plugin_name + "has the following variants only: " + available_variants)
	else:
		print("Expected the root build directory as the first parameter. Got" + plugins_root_dir)