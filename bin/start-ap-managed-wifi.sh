sudo iw wlan0 set power_save off
sleep 20
sudo rm -fr /var/run/hostapd
sudo hostapd -B /etc/hostapd/hostapd.conf
sleep 10
sudo wpa_supplicant -B -iwlan0 -c/etc/wpa_supplicant.conf -Dnl80211
sudo dhclient wlan0
sudo sysctl -w net.ipv4.ip_forward=1
sudo iptables -t nat -A POSTROUTING -s 10.212.0.0/24 ! -d  10.212.0.0/24 -j MASQUERADE
sudo systemctl restart dnsmasq
