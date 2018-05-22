ORG ?= ${USER}
VER ?= 0.2

.PHONY: build push deploy

all: push

build: build-stamp

push: push-stamp

push-stamp: build-stamp
	docker push ${ORG}/round-up-storage-claim:${VER}
	touch $@

build-stamp: Dockerfile index.js key.pem
	docker build -t ${ORG}/round-up-storage-claim:${VER} .
	touch $@

clean:
	rm -rf *-stamp
	rm -rf *.pem

key.pem:
	openssl req \
			-x509 -newkey rsa:4096 \
			-keyout key.pem \
			-out cert.pem \
			-days 365 \
			-nodes \
			-subj "/C=US/ST=California/L=San Francisco/O=OracleCloud/OU=Org/CN=roundup-storage.kube-system.svc"

deploy: deploy-stamp

deploy-stamp: push-stamp
	## These sed's could just as well be PATCH
	sed -i .bkp 's#__REPLACE_ME_ORG__#${ORG}#' manifests/deployment.yaml
	sed -i .bkp 's#__REPLACE_ME_CRT__#$(shell base64 < cert.pem)#' manifests/deployment.yaml
	kubectl -n kube-system create secret generic round-up-certificates --from-file=./cert.pem --from-file=./key.pem
	kubectl -n kube-system apply -f manifests/
