#!/bin/bash

sudo apt-get update
sudo apt-get install redis-server nodejs
sudo wget -q https://git.io/voEUQ -O /tmp/raspap && bash /tmp/raspap
sudo cp ../config/hostapd.conf /etc/ && sudo cp ../config/dnsmasq.conf /etc/ && sudo cp ../config/dhcpcd.conf /etc/ 
sudo python -c "$(curl -fsSL https://raw.githubusercontent.com/platformio/platformio/develop/scripts/get-platformio.py)"
sudo platformio lib --global install Firmata && platformio lib --global install 369
sudo cp 99-platformio-udev.rules /lib/udev/rules.d/
