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
		./boson "$DIR" > /dev/null &
else
	./boson "$CWD" > /dev/null &
fi
