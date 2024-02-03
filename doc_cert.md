1. Get a domain name with configuration => get.tech was used here

2. Use cloudfare to make the domain name go live with some configuration : Added the cloufare nameservers generated to the configuration on the domain name platform 

3. Install helm

4. Create ingress controller using helm

5. Assign DNS to domain name: added the External IP address of the ingress controller to the DNS on cloudfare and did not use a proxy because i want the certificate and (maybe SSL/TLS) to point to cert manager

6. Deploy the application service => already done

7. 

Files

a. secret-cloudfare.yaml
b. clusterissuer-acme.yaml
c. cert-production.yaml

Commands:
brew install kubernetes-helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install quickstart ingress-nginx/ingress-nginx
kubectl get svc
k apply -f secret-cloudfare.yaml
k apply -f clusterissuer-acme.yaml
k create ns cookie-deployment
nslookup cookieclicker.gm-nig-ltd.tech
k apply -f cert-production.yaml
k describe certificate -n cookie-deployment
k get certificaterequest -n cookie-deployment
k describe certificaterequest -n cookie-deployment


If your Deployment and Service are in a different namespace, such as `default`, and you want to connect them with Cert-Manager resources (like `Certificate`, `ClusterIssuer`) or an Ingress in another namespace (e.g., `cookie-deployment`), there are several important considerations and changes you'll need to make to your configuration. Cross-namespace resource referencing in Kubernetes comes with restrictions, particularly for Ingress and Service resources. Here's what would need to change or be considered:

### Deployment and Service in `default` Namespace

If the Deployment and Service are in the `default` namespace, but the Ingress and Cert-Manager resources are in `cookie-deployment`, you have a couple of issues to address:

1. **Ingress Can Only Route to Services in the Same Namespace**: Kubernetes Ingress resources are namespace-scoped and can only route traffic to Services within the same namespace. If your Ingress is in `cookie-deployment` namespace, it cannot directly route traffic to a Service in the `default` namespace.

### Solutions and Adjustments

1. **Move Ingress to the Same Namespace as Service**: To solve the cross-namespace routing issue, you could move your Ingress resource to the same namespace as your Service and Deployment. This would mean adjusting the `namespace` field in your Ingress YAML to `default`.

    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: cookie-app
      namespace: default # This needs to match the namespace of your Service and Deployment
    ```

2. **Certificates and ClusterIssuer**: Cert-Manager's `Certificate` resources can still be created in the same namespace as the Ingress. The `ClusterIssuer` is a cluster-scoped resource and can be used across namespaces, so no changes are needed there. However, the `Certificate` resource needs to be in the same namespace as the Ingress for it to be able to secure it.

    ```yaml
    apiVersion: cert-manager.io/v1
    kind: Certificate
    metadata:
      name: cookieclicker
      namespace: default # This should match the Ingress's namespace
    ```

3. **Secrets Across Namespaces**: Secrets, like your Cloudflare API key, referenced by Cert-Manager `ClusterIssuer` for DNS01 challenges, are typically namespace-scoped. Since `ClusterIssuer` is a cluster-scoped resource, it can reference secrets in any namespace. Ensure that the secret is accessible to Cert-Manager. If your Cert-Manager is deployed in a specific namespace (commonly `cert-manager`), the secret needs to be in that namespace, or you should ensure the `ClusterIssuer` has access to it.

4. **Update DNS Configuration if Necessary**: If you've specified a DNS name in your Ingress (like `cookieclicker.gm-nig-ltd.tech`), ensure that your DNS records (e.g., A or CNAME records) point to the external IP of the Ingress controller's LoadBalancer service. This doesn't change with the namespace adjustment but is a reminder to ensure your DNS is correctly configured to route traffic to your cluster.

### Final Notes

Moving resources across namespaces in Kubernetes requires careful consideration of how those resources interact and their scope (namespace-scoped vs. cluster-scoped). For your setup:

- Keep the Deployment and Service in the `default` namespace.
- Move the Ingress resource to the `default` namespace to match the Service it routes traffic to.
- Adjust the `Certificate` resource to be in the same namespace as the Ingress and Service.
- Ensure `ClusterIssuer` and its referenced secrets are correctly configured and accessible by Cert-Manager.