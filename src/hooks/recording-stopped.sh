#!/usr/bin/env bash

echo '{"type":"proc","msg":"stopped"}' | wscurl ws://localhost:8901
