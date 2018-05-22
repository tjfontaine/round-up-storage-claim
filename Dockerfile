FROM node:8 AS base

COPY index.js /

CMD ["node", "/index.js"]
