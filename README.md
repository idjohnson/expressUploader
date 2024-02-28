# Express Uploader

I had the need for a simple containerized uploader.  Whether you are looking to let students upload assignments, or contractors their timecards or maybe you are running a contest or a tech conference seeking RFPs.

The files are stored in a configurable path that can be mounted to a docker volume or host path, or used in Kubernetes in a PVC.

You can set DESTINATION_PATH at app invokation
```
$ DESTINATION_PATH=/tmp/mypath npm start
```

Or with docker run
```
$ docker run -p 8888:3000 -e DESTINATION_PATH=/tmp/mypath ghcr.io/idjohnson/expressupload:latest
```

It is not exposed with helm because the destination maps to a PVC which is configuration on sizes
```
$ helm install myexpress2 --set pvc.storage=10Gi oci://ghcr.io/idjohnson/expressupload --version 0.1.0
```

