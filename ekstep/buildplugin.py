#!/usr/bin/env python3
import sys, os, subprocess, argparse, shutil, urllib
import logging
import json

def run_cmd(cmd):
    log.info("cmd: %s" % cmd)
    p = subprocess.Popen(cmd, shell=True, stdout=logfd, stderr=subprocess.PIPE)
    (result, error) = p.communicate()
    if p.returncode != 0:
        log.error("Error cmd: %s" % cmd)
        print(error)
        sys.exit(p.returncode)

def init(plugins_root_dir, variant, prod):
	plugin_name = "ekstep"
	git_repo = "https://github.com/projectOpenRAP/EkStep.git"
	plugin_build_dir = "{}/{}".format(plugins_root_dir, plugin_name)
	available_variants = [
		"forwater",
		"diksha"
	]

	build_type = "prod" if prod else "staging"

	if plugins_root_dir is not None:
		if variant in available_variants:
			cmd = "./init.sh {} {} {} {} {} {}".format(plugin_name, git_repo, plugin_build_dir, variant, build_type)
			run_cmd(cmd)
		else:
			log.info(plugin_name + "has the following variants only: " + available_variants)
	else:
		log.info("Expected the root build directory as the first parameter. Got" + plugins_root_dir)