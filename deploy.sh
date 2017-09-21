#!/bin/bash

LOG_FILE="/var/log/deploy.log"

date >> "$LOG_FILE"
echo "Start deployment" >>"$LOG_FILE"
cd /home/wvv/web/game.aistl/
echo "pulling source code..." >> "$LOG_FILE"
git checkout origin master
git pull origin master
echo "Finished." >>"$LOG_FILE"
echo >> $LOG_FILE