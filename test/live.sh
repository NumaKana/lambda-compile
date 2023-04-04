#!/bin/sh

if ! [ "$1" ]; then
  echo "You didn't specify which function to test"
  exit 1
fi

func=$1

aws lambda invoke --invocation-type RequestResponse --function-name "$func" --region ap-northeast-1 --log-type Tail --payload file://test/payload.json output.txt
