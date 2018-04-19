FROM registry.praxis.sml/node:arm
RUN sudo apt-get update && sudo apt-get install hostapd dnsmasq
COPY . ./
RUN sudo cp hostapd.conf /etc/ && sudo cp dnsmasq.conf /etc/ && sudo cp dhcpcd.conf /etc/ && sudo cp interfaces /etc/network/
ENTRYPOINT ["./entrypoint.sh"]
