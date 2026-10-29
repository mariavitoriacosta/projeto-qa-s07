FROM node:24-bookworm-slim AS node_runtime

FROM jenkins/jenkins:2.580.1-jdk21

USER root

# Instala Node e npm a partir da imagem oficial.
COPY --from=node_runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node_runtime /usr/local/lib/node_modules/ /usr/local/lib/node_modules/

RUN ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Instala ferramentas do projeto e bibliotecas utilizadas pelo Cypress.
RUN set -eux; \
    apt-get update; \
    gtk_package=libgtk-3-0; \
    audio_package=libasound2; \
    if apt-cache show libgtk-3-0t64 >/dev/null 2>&1; then \
        gtk_package=libgtk-3-0t64; \
    fi; \
    if apt-cache show libasound2t64 >/dev/null 2>&1; then \
        audio_package=libasound2t64; \
    fi; \
    apt-get install -y --no-install-recommends \
        ca-certificates curl git gosu python3 make g++ unzip \
        "${gtk_package}" "${audio_package}" \
        libgbm-dev libnotify-dev libnss3 libxss1 libxtst6 \
        xauth xvfb fonts-liberation; \
    install -m 0755 -d /etc/apt/keyrings; \
    curl -fsSL https://download.docker.com/linux/debian/gpg \
        -o /etc/apt/keyrings/docker.asc; \
    chmod a+r /etc/apt/keyrings/docker.asc; \
    . /etc/os-release; \
    printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian %s stable\n' \
        "$(dpkg --print-architecture)" "${VERSION_CODENAME}" \
        > /etc/apt/sources.list.d/docker.list; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        docker-ce-cli docker-buildx-plugin docker-compose-plugin; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# Instala os plugins por codigo.
COPY --chown=jenkins:jenkins infra/jenkins/plugins.txt \
    /usr/share/jenkins/ref/plugins.txt

USER jenkins

RUN jenkins-plugin-cli \
    --latest=false \
    --plugin-file /usr/share/jenkins/ref/plugins.txt

USER root

COPY --chown=jenkins:jenkins infra/jenkins/casc.yaml \
    /usr/share/jenkins/ref/casc/jenkins.yaml

COPY infra/jenkins/docker-entrypoint.sh \
    /usr/local/bin/s07-entrypoint.sh

COPY scripts/send_email.py \
    /usr/local/bin/send_pipeline_email.py

# Corrige finais de linha caso o arquivo tenha sido criado no Windows.
RUN sed -i 's/\r$//' /usr/local/bin/s07-entrypoint.sh \
    && chmod 0755 /usr/local/bin/s07-entrypoint.sh

ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc/jenkins.yaml \
    JENKINS_JAVA_OPTS=-Djenkins.install.runSetupWizard=false \
    CYPRESS_CACHE_FOLDER=/var/jenkins_home/.cache/Cypress \
    npm_config_cache=/var/jenkins_home/.npm \
    CI=true

ENTRYPOINT ["/usr/local/bin/s07-entrypoint.sh"]