#!/bin/bash

LOG_FILE="game.log"

date >> "$LOG_FILE"
echo "Start deployment" >>"$LOG_FILE"
cd /home/wvv/web/game.aistl/
echo "pulling source code..." >> "$LOG_FILE"
git reset --hard
git pull origin master
echo "Finished." >>"$LOG_FILE"
echo >> $LOG_FILE