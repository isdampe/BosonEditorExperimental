#!/bin/sh
ABS=$(readlink -f $0)
SCRIPTPATH=`dirname "$ABS"`
CWD=`pwd`
if [ "$1" ]
	then
		DIR=$1
fi
cd $SCRIPTPATH
if [ "$DIR" ]
	then
		./boson "$DIR" > /dev/null 2>&1 &
else
	./boson "$CWD" > /dev/null 2>&1 &
fi