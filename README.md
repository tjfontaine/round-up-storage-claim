# PersistsentVolumeClaim Mutating Webhook

If for instance, you need to enforce that all Persistent Volume Claims are a
_minimum_ size, this controller sample is for you! A Kubernetes cluster of >=
1.9.0 with the Mutating Webhook Admission Controller enabled is required for
this to work.

## Building and Deploying

Build and push the container image for the controller to your registry.


```bash
make push ORG=my.private.registry.com/username
```

Assuming a working `kubectl` to the cluster in question, you can then

```bash
make deploy ORG=my.private.registry.com/username
```

## Debug

```bash
kubectl -n kube-system get pods
kubectl -n kube-system logs -f round-up-storage-claim-5877857558-gdgfc
```
