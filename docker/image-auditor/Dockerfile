FROM node:6.10.2

MAINTAINER Basile Châtillon <basile.chatillon@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system.
# 
COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

EXPOSE 2205

ENTRYPOINT ["node", "/opt/app/auditor.js"]