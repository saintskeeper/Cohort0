Assigning a DNS name to the external IP of your ingress controller and setting up certificates for HTTPS with cert-manager involves several steps. The YAML snippets you provided define two resources in Kubernetes:

1. A `Certificate` resource for your domain, which tells cert-manager to obtain a certificate for your domain from Let's Encrypt.
2. A `ClusterIssuer` resource, which is a cert-manager entity that defines how to communicate with Let's Encrypt to obtain the certificate.

Here’s a breakdown of how to proceed with these configurations:

### Step 1: Assign a DNS Name to the External IP

1. **Find the External IP Address**: First, you need to find the external IP address assigned to your ingress controller. You can get this by running:
   ```bash
   kubectl get svc -n <namespace-of-ingress-controller>
   ```
   Look for the external IP of your ingress controller service.

2. **Update DNS Records**: Go to the DNS management page for your domain (where your domain's DNS is hosted) and create an A record pointing `www.example.com` (or another subdomain of your choice) to the external IP address of your ingress controller.

### Step 2: Install and Configure cert-manager

If you haven't already installed cert-manager in your Kubernetes cluster, you'll need to do so. cert-manager automates the management and issuance of TLS certificates from various issuing sources.

1. **Install cert-manager**: Follow the official [cert-manager documentation](https://cert-manager.io/docs/installation/) to install it. Typically, this involves applying a few YAML files with `kubectl`.

2. **Apply the ClusterIssuer Configuration**: Save your `ClusterIssuer` configuration into a file (e.g., `cluster-issuer.yaml`) and apply it with `kubectl`:
   ```bash
   kubectl apply -f cluster-issuer.yaml
   ```
   Ensure you've replaced placeholders with your actual email, and decided whether to use the Let's Encrypt production or staging server.

### Step 3: Configure Your Certificate

1. **Prepare the Certificate YAML**: Make sure your `Certificate` resource points to your domain and references the correct `ClusterIssuer`. The `dnsNames` field should include the domain you want to secure with HTTPS.

2. **Apply the Certificate Configuration**: Save your `Certificate` configuration to a file (e.g., `certificate.yaml`) and apply it with `kubectl`:
   ```bash
   kubectl apply -f certificate.yaml
   ```
   This instructs cert-manager to obtain a certificate for your domain from Let's Encrypt via the specified `ClusterIssuer`.

### Step 4: Verify Certificate Issuance

After applying the `Certificate` configuration, cert-manager will attempt to obtain a certificate from Let's Encrypt. You can check the status of the certificate issuance by running:
```bash
kubectl describe certificate <certificate-name> -n <namespace>
```
Replace `<certificate-name>` and `<namespace>` with the name of your certificate and its namespace, respectively.

### Additional Information

- **DNS Provider Configuration**: The configuration you provided includes a section for Cloudflare as the DNS provider. Ensure you have the required credentials stored in Kubernetes as secrets (e.g., `cloudflare-api-key-secret`) and referenced correctly in your `ClusterIssuer`.
- **Challenge Types**: The `ClusterIssuer` configuration you provided is set up for a DNS-01 challenge with Cloudflare. If your DNS provider is different, you'll need to adjust the `solvers` configuration accordingly.

By following these steps, you'll have assigned a DNS name to your ingress controller's external IP and configured HTTPS for your domain using cert-manager and Let's Encrypt.

################ Adding my subdomain for the cookie app ####################
To update your DNS records for the domain `gm-nig-ltd.tech` using Cloudflare and point a subdomain (e.g., `cookieclicker.gm-nig-ltd.tech`) to an external IP address (e.g., `212.2.240.68`) of your Kubernetes ingress controller, follow these steps. This process involves logging into your Cloudflare account, navigating to the DNS management section for your domain, and creating an A record.

### Step 1: Log into Cloudflare

1. **Open your web browser** and go to [Cloudflare's website](https://www.cloudflare.com/).
2. **Log in** to your Cloudflare account by clicking on the **Log In** button at the top right corner and entering your credentials.

### Step 2: Navigate to Your Domain's DNS Management Page

1. Once logged in, you'll see the dashboard with a list of your domains.
2. **Select your domain** `gm-nig-ltd.tech` by clicking on it. This action takes you to the domain's overview page.
3. From the top menu options, **click on the "DNS"** tab to access the DNS management page for your domain.

### Step 3: Create an A Record

1. On the DNS management page, you'll see a section where you can add new DNS records.
2. To create a new A record, look for a button or link that says **"Add record"** or **"+ Add"** within the DNS records section.
3. In the **Type** field, select **A** from the dropdown menu. This specifies that you're creating an A record.
4. In the **Name** field, enter the subdomain you want to use. For pointing directly to `gm-nig-ltd.tech`, you can enter `@` to represent the root domain. For a subdomain like `cookieclicker.gm-nig-ltd.tech`, just enter `cookieclicker`.
5. In the **IPv4 address** field, enter the external IP address of your ingress controller, which is `212.2.240.68`.
6. Depending on your needs, you can adjust the **TTL** (Time To Live) value, but the default value is typically fine for most purposes.
7. **Save** the record by clicking on the **Save** button or its equivalent.

### Step 4: Verify the DNS Record

After adding the A record, it might take some time for the changes to propagate across the internet due to DNS caching. You can check if the record is correctly pointing to the external IP by using DNS lookup tools like `nslookup` or `dig`.

For example, to use `nslookup`:

```bash
nslookup cookieclicker.gm-nig-ltd.tech
```

This command should return the external IP address `212.2.240.68` as one of the addresses for `cookieclicker.gm-nig-ltd.tech`.

### Additional Tips

- **Propagation Time**: DNS changes can take up to 48 hours to fully propagate, but they often take effect much sooner.
- **Cloudflare Proxies**: If you're using Cloudflare's proxy (the cloud icon next to the DNS record is orange), the actual IP address will be hidden behind Cloudflare's reverse proxy for additional security and performance features. If you want to bypass Cloudflare's proxy and reveal the actual IP, you can click the cloud icon so that it turns grey, which disables the proxy.
- **SSL/TLS Configuration**: Ensure that your Cloudflare SSL/TLS encryption mode matches your setup requirements and is compatible with your ingress controller's configuration.

By following these steps, you will have successfully pointed your subdomain `cookieclicker.gm-nig-ltd.tech` to the external IP address of your Kubernetes ingress controller, allowing traffic to be routed correctly.