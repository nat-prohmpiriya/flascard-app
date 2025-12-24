# Kubernetes Snippets

Comprehensive Kubernetes manifests and kubectl commands for container orchestration.

---

## Basic Pod
- difficulty: easy
- description: Simplest pod definition running a single container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
```

---

## Pod with Resources
- difficulty: easy
- description: Pod with CPU and memory limits and requests

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      resources:
        requests:
          memory: "128Mi"
          cpu: "250m"
        limits:
          memory: "256Mi"
          cpu: "500m"
```

---

## Pod with Environment Variables
- difficulty: easy
- description: Pod with environment variables from different sources

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      env:
        - name: APP_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db_password
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
```

---

## Pod with Volume Mounts
- difficulty: medium
- description: Pod mounting ConfigMap and Secret as volumes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volume-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
        - name: secret-volume
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: config-volume
      configMap:
        name: app-config
    - name: secret-volume
      secret:
        secretName: app-secrets
```

---

## Pod with Liveness Probe
- difficulty: medium
- description: Pod with HTTP liveness probe for health checking

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      ports:
        - containerPort: 8080
      livenessProbe:
        httpGet:
          path: /health
          port: 8080
        initialDelaySeconds: 15
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 3
```

---

## Pod with Readiness Probe
- difficulty: medium
- description: Pod with readiness probe to control traffic routing

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: readiness-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      ports:
        - containerPort: 8080
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 5
        successThreshold: 1
        failureThreshold: 3
```

---

## Pod with Startup Probe
- difficulty: medium
- description: Pod with startup probe for slow-starting containers

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: startup-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      ports:
        - containerPort: 8080
      startupProbe:
        httpGet:
          path: /startup
          port: 8080
        initialDelaySeconds: 0
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 30
      livenessProbe:
        httpGet:
          path: /health
          port: 8080
        periodSeconds: 10
```

---

## Pod with TCP Probe
- difficulty: easy
- description: Pod with TCP socket probe for non-HTTP services

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tcp-probe-pod
spec:
  containers:
    - name: redis
      image: redis:7
      ports:
        - containerPort: 6379
      livenessProbe:
        tcpSocket:
          port: 6379
        initialDelaySeconds: 10
        periodSeconds: 5
      readinessProbe:
        tcpSocket:
          port: 6379
        initialDelaySeconds: 5
        periodSeconds: 5
```

---

## Pod with Command Probe
- difficulty: medium
- description: Pod with exec command probe for custom health checks

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: exec-probe-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      livenessProbe:
        exec:
          command:
            - /bin/sh
            - -c
            - pg_isready -U postgres -h localhost
        initialDelaySeconds: 30
        periodSeconds: 10
```

---

## Multi-Container Pod
- difficulty: medium
- description: Pod with sidecar container sharing volumes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
    - name: log-shipper
      image: fluentd:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
          readOnly: true
  volumes:
    - name: shared-logs
      emptyDir: {}
```

---

## Init Container
- difficulty: medium
- description: Pod with init container for setup tasks

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-container-pod
spec:
  initContainers:
    - name: init-db
      image: busybox:1.36
      command:
        - sh
        - -c
        - |
          until nc -z db-service 5432; do
            echo "Waiting for database..."
            sleep 2
          done
    - name: init-config
      image: busybox:1.36
      command: ["sh", "-c", "cp /config/* /app/config/"]
      volumeMounts:
        - name: config
          mountPath: /config
        - name: app-config
          mountPath: /app/config
  containers:
    - name: app
      image: myapp:latest
      volumeMounts:
        - name: app-config
          mountPath: /app/config
  volumes:
    - name: config
      configMap:
        name: app-config
    - name: app-config
      emptyDir: {}
```

---

## Pod Security Context
- difficulty: medium
- description: Pod with security context for non-root execution

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
    - name: app
      image: myapp:latest
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

---

## Pod Affinity
- difficulty: hard
- description: Pod with affinity rules for co-location

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: affinity-pod
  labels:
    app: web
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - cache
          topologyKey: kubernetes.io/hostname
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchLabels:
                app: web
            topologyKey: kubernetes.io/hostname
  containers:
    - name: web
      image: nginx:latest
```

---

## Node Affinity
- difficulty: medium
- description: Pod with node affinity for specific node selection

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: node-affinity-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: disktype
                operator: In
                values:
                  - ssd
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 1
          preference:
            matchExpressions:
              - key: zone
                operator: In
                values:
                  - us-west-1a
  containers:
    - name: app
      image: myapp:latest
```

---

## Pod with Tolerations
- difficulty: medium
- description: Pod that tolerates node taints

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: toleration-pod
spec:
  tolerations:
    - key: "dedicated"
      operator: "Equal"
      value: "gpu"
      effect: "NoSchedule"
    - key: "node.kubernetes.io/not-ready"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 300
  containers:
    - name: gpu-app
      image: gpu-app:latest
```

---

## Deployment Basic
- difficulty: easy
- description: Basic deployment with replicas and rolling update

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
```

---

## Deployment with Rolling Update
- difficulty: medium
- description: Deployment with custom rolling update strategy

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: myapp:v2
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## Deployment with Recreate Strategy
- difficulty: easy
- description: Deployment that terminates all pods before creating new ones

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: db-deployment
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: postgres-pvc
```

---

## Complete Deployment
- difficulty: hard
- description: Production-ready deployment with all best practices

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-app
  labels:
    app: production-app
    version: v1.0.0
  annotations:
    kubernetes.io/change-cause: "Deploy v1.0.0"
spec:
  replicas: 3
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: production-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: production-app
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      serviceAccountName: app-service-account
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
      containers:
        - name: app
          image: myapp:v1.0.0
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 8080
          env:
            - name: APP_ENV
              value: "production"
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: production-app
                topologyKey: kubernetes.io/hostname
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: production-app
```

---

## ReplicaSet
- difficulty: easy
- description: ReplicaSet for maintaining pod replicas (usually managed by Deployment)

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
```

---

## DaemonSet
- difficulty: medium
- description: DaemonSet running one pod per node

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-daemonset
  namespace: kube-system
  labels:
    app: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
      containers:
        - name: fluentd
          image: fluentd:v1.16
          resources:
            limits:
              memory: 200Mi
            requests:
              cpu: 100m
              memory: 200Mi
          volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: containers
              mountPath: /var/lib/docker/containers
              readOnly: true
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: containers
          hostPath:
            path: /var/lib/docker/containers
```

---

## StatefulSet
- difficulty: hard
- description: StatefulSet for stateful applications with stable network identities

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
              name: postgres
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 10Gi
```

---

## Service ClusterIP
- difficulty: easy
- description: Internal service accessible only within the cluster

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
```

---

## Service NodePort
- difficulty: easy
- description: Service exposed on each node's IP at a static port

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-nodeport
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
      nodePort: 30080
      protocol: TCP
```

---

## Service LoadBalancer
- difficulty: easy
- description: Service exposed via cloud provider's load balancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-loadbalancer
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
```

---

## Headless Service
- difficulty: medium
- description: Service without cluster IP for direct pod addressing

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - name: postgres
      port: 5432
      targetPort: 5432
```

---

## ExternalName Service
- difficulty: easy
- description: Service mapping to external DNS name

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: database.example.com
```

---

## Multi-Port Service
- difficulty: easy
- description: Service exposing multiple ports

```yaml
apiVersion: v1
kind: Service
metadata:
  name: multi-port-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
    - name: metrics
      port: 9090
      targetPort: 9090
```

---

## ConfigMap from Literal
- difficulty: easy
- description: ConfigMap with key-value pairs

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  LOG_LEVEL: info
  DATABASE_HOST: postgres-service
  DATABASE_PORT: "5432"
```

---

## ConfigMap from File
- difficulty: easy
- description: ConfigMap containing file contents

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }

        location /api {
            proxy_pass http://backend-service:8080;
        }
    }
```

---

## Secret Opaque
- difficulty: easy
- description: Secret for storing sensitive data (base64 encoded)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  username: YWRtaW4=
  password: cGFzc3dvcmQxMjM=
stringData:
  api_key: plain-text-will-be-encoded
```

---

## Secret Docker Registry
- difficulty: medium
- description: Secret for pulling images from private registry

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: docker-registry-secret
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: eyJhdXRocyI6eyJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOnsidXNlcm5hbWUiOiJ1c2VyIiwicGFzc3dvcmQiOiJwYXNzIiwiYXV0aCI6ImRYTmxjanB3WVhOeiJ9fX0=
```

---

## Secret TLS
- difficulty: medium
- description: Secret for TLS certificate and key

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTi...
  tls.key: LS0tLS1CRUdJTi...
```

---

## Ingress Basic
- difficulty: easy
- description: Basic ingress routing to a service

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
```

---

## Ingress with TLS
- difficulty: medium
- description: Ingress with TLS termination

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: tls-secret
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
```

---

## Ingress Multiple Hosts
- difficulty: medium
- description: Ingress routing multiple domains to different services

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-host-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
    - host: web.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

---

## Ingress Path-Based Routing
- difficulty: medium
- description: Ingress routing different paths to different services

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-ingress
  annotations:
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-service
                port:
                  number: 8080
          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin-service
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

---

## PersistentVolume
- difficulty: medium
- description: PersistentVolume for local storage

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-storage
  local:
    path: /mnt/data
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - worker-node-1
```

---

## PersistentVolumeClaim
- difficulty: easy
- description: PersistentVolumeClaim requesting storage

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 5Gi
```

---

## StorageClass
- difficulty: medium
- description: StorageClass for dynamic provisioning

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

---

## ServiceAccount
- difficulty: easy
- description: ServiceAccount for pod identity

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: default
automountServiceAccountToken: true
```

---

## Role
- difficulty: medium
- description: Role defining permissions within a namespace

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
```

---

## RoleBinding
- difficulty: medium
- description: RoleBinding granting role to service account

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
  - kind: ServiceAccount
    name: app-service-account
    namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

---

## ClusterRole
- difficulty: medium
- description: ClusterRole for cluster-wide permissions

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secret-reader
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["namespaces"]
    verbs: ["get", "list"]
```

---

## ClusterRoleBinding
- difficulty: medium
- description: ClusterRoleBinding for cluster-wide access

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-secrets-global
subjects:
  - kind: ServiceAccount
    name: admin-service-account
    namespace: kube-system
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

---

## HorizontalPodAutoscaler
- difficulty: medium
- description: HPA scaling based on CPU and memory metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

---

## HPA with Custom Metrics
- difficulty: hard
- description: HPA scaling based on custom metrics from Prometheus

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: custom-metrics-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-deployment
  minReplicas: 1
  maxReplicas: 20
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
    - type: External
      external:
        metric:
          name: queue_messages_ready
          selector:
            matchLabels:
              queue: worker-queue
        target:
          type: AverageValue
          averageValue: "30"
```

---

## VerticalPodAutoscaler
- difficulty: medium
- description: VPA for automatic resource recommendations

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-deployment
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: app
        minAllowed:
          cpu: 100m
          memory: 128Mi
        maxAllowed:
          cpu: 2
          memory: 2Gi
        controlledResources: ["cpu", "memory"]
```

---

## Job
- difficulty: easy
- description: Job running a task to completion

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
spec:
  ttlSecondsAfterFinished: 3600
  backoffLimit: 3
  activeDeadlineSeconds: 600
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: backup
          image: backup-tool:latest
          command: ["./backup.sh"]
          env:
            - name: S3_BUCKET
              value: "my-backup-bucket"
```

---

## Job Parallel
- difficulty: medium
- description: Job running multiple parallel tasks

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-job
spec:
  completions: 10
  parallelism: 3
  completionMode: Indexed
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: worker
          image: worker:latest
          command:
            - ./process.sh
          env:
            - name: JOB_INDEX
              valueFrom:
                fieldRef:
                  fieldPath: metadata.annotations['batch.kubernetes.io/job-completion-index']
```

---

## CronJob
- difficulty: easy
- description: CronJob running on a schedule

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-backup
spec:
  schedule: "0 2 * * *"
  timeZone: "America/New_York"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: backup:latest
              command: ["./backup.sh"]
```

---

## NetworkPolicy Deny All
- difficulty: medium
- description: NetworkPolicy denying all ingress traffic by default

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

---

## NetworkPolicy Allow Specific
- difficulty: medium
- description: NetworkPolicy allowing traffic from specific pods and namespaces

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: frontend
          podSelector:
            matchLabels:
              app: web
        - podSelector:
            matchLabels:
              app: gateway
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

---

## LimitRange
- difficulty: medium
- description: LimitRange setting default and max resources per container

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: container-limits
  namespace: development
spec:
  limits:
    - type: Container
      default:
        cpu: "500m"
        memory: "512Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      max:
        cpu: "2"
        memory: "2Gi"
      min:
        cpu: "50m"
        memory: "64Mi"
    - type: PersistentVolumeClaim
      max:
        storage: "10Gi"
      min:
        storage: "1Gi"
```

---

## ResourceQuota
- difficulty: medium
- description: ResourceQuota limiting namespace resource usage

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: namespace-quota
  namespace: development
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    pods: "50"
    services: "10"
    secrets: "20"
    configmaps: "20"
    persistentvolumeclaims: "10"
    requests.storage: "100Gi"
```

---

## PodDisruptionBudget
- difficulty: medium
- description: PDB ensuring minimum availability during disruptions

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: myapp
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb-percent
spec:
  maxUnavailable: 25%
  selector:
    matchLabels:
      app: myapp
```

---

## PriorityClass
- difficulty: medium
- description: PriorityClass for pod scheduling priority

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
preemptionPolicy: PreemptLowerPriority
description: "High priority for critical workloads"
---
apiVersion: v1
kind: Pod
metadata:
  name: high-priority-pod
spec:
  priorityClassName: high-priority
  containers:
    - name: app
      image: myapp:latest
```

---

## Namespace with Labels
- difficulty: easy
- description: Namespace with labels for organization and policies

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    name: production
    environment: prod
    team: platform
  annotations:
    owner: platform-team@example.com
```

---

## kubectl Get Resources
- difficulty: easy
- description: Common kubectl get commands for viewing resources

```bash
# Get all pods
kubectl get pods

# Get pods with more info
kubectl get pods -o wide

# Get pods in all namespaces
kubectl get pods -A

# Get specific resource
kubectl get deployment nginx-deployment

# Get with labels
kubectl get pods -l app=nginx

# Get with custom columns
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase

# Get as YAML
kubectl get deployment nginx -o yaml

# Watch for changes
kubectl get pods -w
```

---

## kubectl Describe
- difficulty: easy
- description: Describe resources for detailed information and events

```bash
# Describe pod
kubectl describe pod nginx-pod

# Describe deployment
kubectl describe deployment app-deployment

# Describe node
kubectl describe node worker-1

# Describe service
kubectl describe service app-service

# Describe events
kubectl get events --sort-by='.lastTimestamp'
```

---

## kubectl Create and Apply
- difficulty: easy
- description: Create and apply resources from files

```bash
# Create from file
kubectl create -f pod.yaml

# Apply (create or update)
kubectl apply -f deployment.yaml

# Apply from directory
kubectl apply -f ./manifests/

# Apply with record
kubectl apply -f deployment.yaml --record

# Create namespace
kubectl create namespace production

# Create configmap from literal
kubectl create configmap app-config --from-literal=key=value

# Create secret
kubectl create secret generic db-secret --from-literal=password=secret123
```

---

## kubectl Delete
- difficulty: easy
- description: Delete resources from cluster

```bash
# Delete pod
kubectl delete pod nginx-pod

# Delete from file
kubectl delete -f deployment.yaml

# Delete by label
kubectl delete pods -l app=nginx

# Delete all pods in namespace
kubectl delete pods --all -n development

# Force delete stuck pod
kubectl delete pod stuck-pod --grace-period=0 --force

# Delete namespace (and all resources)
kubectl delete namespace development
```

---

## kubectl Logs
- difficulty: easy
- description: View container logs

```bash
# Pod logs
kubectl logs nginx-pod

# Follow logs
kubectl logs -f nginx-pod

# Previous container logs
kubectl logs nginx-pod --previous

# Specific container in multi-container pod
kubectl logs multi-pod -c sidecar

# Logs with timestamps
kubectl logs nginx-pod --timestamps

# Last N lines
kubectl logs nginx-pod --tail=100

# Logs since duration
kubectl logs nginx-pod --since=1h

# All pods with label
kubectl logs -l app=nginx --all-containers
```

---

## kubectl Exec
- difficulty: easy
- description: Execute commands in containers

```bash
# Execute command
kubectl exec nginx-pod -- ls -la

# Interactive shell
kubectl exec -it nginx-pod -- /bin/bash

# Specific container
kubectl exec -it multi-pod -c app -- /bin/sh

# Run command as different user
kubectl exec nginx-pod -- whoami
```

---

## kubectl Port Forward
- difficulty: easy
- description: Forward local port to pod or service

```bash
# Forward to pod
kubectl port-forward pod/nginx-pod 8080:80

# Forward to service
kubectl port-forward svc/app-service 8080:80

# Forward to deployment
kubectl port-forward deployment/app 8080:80

# Bind to all interfaces
kubectl port-forward --address 0.0.0.0 pod/nginx 8080:80

# Background process
kubectl port-forward svc/app-service 8080:80 &
```

---

## kubectl Scale
- difficulty: easy
- description: Scale deployments and statefulsets

```bash
# Scale deployment
kubectl scale deployment app-deployment --replicas=5

# Scale statefulset
kubectl scale statefulset postgres --replicas=3

# Scale to zero
kubectl scale deployment app --replicas=0

# Scale multiple
kubectl scale deployment app1 app2 --replicas=3
```

---

## kubectl Rollout
- difficulty: medium
- description: Manage deployment rollouts

```bash
# Check rollout status
kubectl rollout status deployment/app-deployment

# View rollout history
kubectl rollout history deployment/app-deployment

# Rollback to previous version
kubectl rollout undo deployment/app-deployment

# Rollback to specific revision
kubectl rollout undo deployment/app-deployment --to-revision=2

# Pause rollout
kubectl rollout pause deployment/app-deployment

# Resume rollout
kubectl rollout resume deployment/app-deployment

# Restart deployment (trigger rolling update)
kubectl rollout restart deployment/app-deployment
```

---

## kubectl Label and Annotate
- difficulty: easy
- description: Add and modify labels and annotations

```bash
# Add label
kubectl label pod nginx-pod env=production

# Overwrite label
kubectl label pod nginx-pod env=staging --overwrite

# Remove label
kubectl label pod nginx-pod env-

# Add annotation
kubectl annotate pod nginx-pod description="Web server"

# Label multiple resources
kubectl label pods -l app=nginx tier=frontend
```

---

## kubectl Taint and Drain
- difficulty: medium
- description: Manage node taints and drain for maintenance

```bash
# Add taint to node
kubectl taint nodes node1 dedicated=gpu:NoSchedule

# Remove taint
kubectl taint nodes node1 dedicated=gpu:NoSchedule-

# Cordon node (prevent scheduling)
kubectl cordon node1

# Uncordon node
kubectl uncordon node1

# Drain node (evict pods)
kubectl drain node1 --ignore-daemonsets --delete-emptydir-data

# Drain with grace period
kubectl drain node1 --grace-period=60
```

---

## kubectl Debug
- difficulty: medium
- description: Debug pods and nodes with ephemeral containers

```bash
# Debug with ephemeral container
kubectl debug pod/myapp -it --image=busybox

# Copy pod with debug container
kubectl debug pod/myapp -it --copy-to=myapp-debug --container=debug

# Debug node
kubectl debug node/worker-1 -it --image=ubuntu

# Run debug pod in same namespace
kubectl run debug --rm -it --image=busybox -- /bin/sh
```

---

## kubectl Top
- difficulty: easy
- description: View resource usage metrics

```bash
# Node metrics
kubectl top nodes

# Pod metrics
kubectl top pods

# Pod metrics in namespace
kubectl top pods -n production

# Pod metrics with containers
kubectl top pods --containers

# Sort by memory
kubectl top pods --sort-by=memory
```

---

## kubectl Config Context
- difficulty: easy
- description: Manage kubeconfig contexts

```bash
# View current context
kubectl config current-context

# List all contexts
kubectl config get-contexts

# Switch context
kubectl config use-context production-cluster

# Set default namespace
kubectl config set-context --current --namespace=production

# View kubeconfig
kubectl config view

# Add cluster
kubectl config set-cluster my-cluster --server=https://k8s.example.com
```

---

## Helm Chart Structure
- difficulty: medium
- description: Basic Helm chart directory structure

```yaml
# Chart.yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 1.0.0
appVersion: "2.0.0"
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```

---

## Helm Values
- difficulty: medium
- description: Helm values file for chart configuration

```yaml
# values.yaml
replicaCount: 3

image:
  repository: myapp
  tag: "v2.0.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: app.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

postgresql:
  enabled: true
  auth:
    username: myapp
    database: myapp
```

---

## Helm Template Deployment
- difficulty: hard
- description: Helm template for Kubernetes Deployment

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
          {{- with .Values.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          envFrom:
            - configMapRef:
                name: {{ include "myapp.fullname" . }}-config
            - secretRef:
                name: {{ include "myapp.fullname" . }}-secrets
```

---

## Helm Commands
- difficulty: easy
- description: Common Helm commands for chart management

```bash
# Add repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search charts
helm search repo nginx

# Install chart
helm install myapp ./mychart -n production

# Install with values file
helm install myapp ./mychart -f production-values.yaml

# Upgrade release
helm upgrade myapp ./mychart --set image.tag=v2.0.0

# Rollback
helm rollback myapp 1

# List releases
helm list -A

# Uninstall
helm uninstall myapp -n production

# Template (dry-run)
helm template myapp ./mychart > rendered.yaml

# Show values
helm show values bitnami/postgresql
```

---

## Kustomize Base
- difficulty: medium
- description: Kustomize base configuration

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml

commonLabels:
  app: myapp

configMapGenerator:
  - name: app-config
    literals:
      - LOG_LEVEL=info
```

---

## Kustomize Overlay
- difficulty: medium
- description: Kustomize overlay for environment-specific configuration

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production

resources:
  - ../../base

namePrefix: prod-

commonLabels:
  environment: production

replicas:
  - name: myapp
    count: 5

images:
  - name: myapp
    newTag: v2.0.0

configMapGenerator:
  - name: app-config
    behavior: merge
    literals:
      - LOG_LEVEL=warn

patches:
  - patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: 1Gi
    target:
      kind: Deployment
      name: myapp
```

---

## Kustomize Apply
- difficulty: easy
- description: Apply Kustomize configurations

```bash
# Preview generated manifests
kubectl kustomize overlays/production

# Apply directly
kubectl apply -k overlays/production

# Apply with prune
kubectl apply -k overlays/production --prune -l app=myapp

# Build to file
kubectl kustomize overlays/production > manifests.yaml
```
