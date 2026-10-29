#!/bin/sh
set -eu

: "${JENKINS_ADMIN_USER:?Defina JENKINS_ADMIN_USER.}"
: "${JENKINS_ADMIN_PASSWORD:?Defina JENKINS_ADMIN_PASSWORD.}"

if [ "$(id -u)" = "0" ]; then
    if [ -S /var/run/docker.sock ]; then
        socket_gid="$(stat -c '%g' /var/run/docker.sock)"
        socket_group="$(getent group "$socket_gid" | cut -d: -f1 || true)"

        if [ -z "$socket_group" ]; then
            socket_group="s07-docker-${socket_gid}"
            groupadd --gid "$socket_gid" "$socket_group"
        fi

        usermod --append --groups "$socket_group" jenkins
    fi

    exec gosu jenkins /usr/bin/tini -- /usr/local/bin/jenkins.sh "$@"
fi

exec /usr/bin/tini -- /usr/local/bin/jenkins.sh "$@"