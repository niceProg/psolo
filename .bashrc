# Menampilkan ASCII art dengan figlet
echo ""
figlet -c "Halo, Wisnu!" | lolcat

# Menampilkan spesifikasi server
echo "========================================" | lolcat
echo "Spesifikasi Server:"
echo "========================================" | lolcat
printf "%-15s: %s\n" "Hostname" "$(hostname)"
printf "%-15s: %s\n" "Sistem Operasi" "$(uname -s) $(uname -r) $(uname -m)"
printf "%-15s: %s\n" "Jumlah Core CPU" "$(nproc)"
printf "%-15s: %s\n" "RAM" "$(free -h | grep Mem | awk '{print "Used: " $3 " | Total: " $2}')"
printf "%-15s: %s\n" "Disk" "$(df -h / | grep '/$' | awk '{print "Used: " $3 " | Total: " $2}')"
printf "%-15s: %s\n" "Uptime" "$(uptime -p)"
echo "========================================" | lolcat
latency=$(ping -c 1 google.com | grep 'time=' | awk -F'=' '{print $2 " ms"}')
printf "%-15s: %s\n" "Server Latency" "$latency"
echo "========================================" | lolcat
echo "Jangan lupa ngopi bray :)"
