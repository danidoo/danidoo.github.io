## Creando un Website cifrado con TLS usando llaves del CloudHSM

### 1. Cree un usuario para el servidor web y comparta llave privada
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __1.1.__ Abra en una nueva pestaña o ventana del navegador del [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/home) en la terminal de la instancia
- __1.2.__ Seleccione el **Logs** en el menu lateral
- __1.3.__ Haga click en el "Log Group" con el nombre **/aws/cloudhsm/cluster-&lt;cluster_id&gt;** y después en **Search Log Group**
- __1.4.__ Filtre los logs por el evento de generación de par de llaves **CN_GENERATE_KEY_PAIR**
- __1.5.__ Haga click en la flecha para expandir los logs

    Entre el **Key Handle** de la llave publica generado con openssl: <input type="text" id="openssl-priv-key-handle" onkeyup="copyval(this);"/><br>
<br>

- __1.6.__ Vuelva a la pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home) en la terminal de la instancia
- __1.7.__ Entre en el agente de administración del cluster con el comando:

    ./cloudhsm_mgmt_util.sh

- __1.8.__ Haga login en el CloudHSM

    loginHSM -u CU -s user1 -p defaultPassword

- __1.9.__ Exporte la llave publica generado con el openssl:

    exportPrivateKey -k 262166 -w 262167 -out webserver.pem

- __1.10.__ Saiga el cliente:

    exit

- __1.11.__ Abra en una nueva pestaña o ventana del navegador del [AWS Certificate Manager](https://console.aws.amazon.com/acm/home)
- __1.12.__ Si ves la opción **Get started** haga click en el que esta debajo de **Provision certificates**
- __1.13.__ Haga click en **Import a certificate**
- __1.14.__ En la ventana de terminal del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home), ejecute el comando:

    cat webserver.crt

- __1.15.__ Copie la informacion y la pegue en el campo **Certificate body**

- __1.16.__ En la ventana de terminal del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home), ejecute el comando:

    cat webserver.pem

- __1.17.__ Copie la informacion y la pegue en el campo **Certificate private key**
- __1.18.__ Haga click en **Import**
- __1.19.__ Revise el mensaje y haga click de nuevo en **Import**
</details>

### 2. Cree un balanceador usando el certificado importado
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __2.1.__ Vuelva a la pestaña o ventana del navegador del [AWS EC2](https://console.aws.amazon.com/ec2/home)
- __2.2.__ En el menu lateral haga click en **Load Balancers**
- __2.3.__ Haga click en **Create Load Balancer**
- __2.4.__ Haga click en **Create** debajo de **Application Load Balancer**
- __2.5.__ En **Name** llene con **acm-webserver**
- __2.6.__ En **Listeners**, cambie el protocolo de "HTTP" a **HTTPS**
- __2.7.__ En **VPC** seleccione el que tiene nombre **cloudhsm-vpc**
- __2.8.__ Seleccione las AZ **us-east-1a** y **us-east-1b** y seleccione las subnets **public** para cada una.
- __2.9.__ Haga click en **Next: Configure Security Settings**
- __2.10.__ Deje seleccionado **Choose a certificate from ACM (recommended) y seleccione el certificado importado anteriormente
- __2.11.__ Haga click en **Next: Configure Security Groups**
- __2.12.__ Seleccione **Create a new security group**
- __2.13.__ En **Security group name** llene con **acm-webserver-sg**
- __2.14.__ En "Type" seleccione **HTTPS**
- __2.15.__ Haga click en **Next: Configure Routing**
- __2.16.__ En **Name** llene con **webserver1**
- __2.17.__ Haga click en **Advanced health check settings**
- __2.18.__ En la opción **Healthy threashold** cambie el valor para 2
- __2.19.__ En la opción **Interval** cambie el valor para 10
- __2.20.__ Haga click en **Next: Register Targets**
- __2.21.__ En la sección **Instances** seleccione la instancia **webserver1** y haga click en **Add to registered**
- __2.22.__ Haga click en **Next: Review** y después en **Create**
- __2.23.__ Haga click en **Close**
- __2.24.__ Llene abajo la información del nombre DNS el balanceador:

    Entre el **DNS name** del balanceador: <input type="text" id="lb-dns" onkeyup="copyval(this);"/><br>
<br>
</details>

### 3. Agregue HTTP al Security Group el webserver1
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __3.1.__ Vuelva a la pestaña o ventana del navegador del [AWS EC2](https://console.aws.amazon.com/ec2/home)
- __3.2.__ En el menu lateral haga click en **Security Groups**
- __3.3.__ Seleccione el **webserver1-sg** y haga click en la pestaña **Inbound**
- __3.4.__ Haga click en **Edit** y después en **Add Rule**
- __3.5.__ En la ultima linea que se creo, seleccione el tipo **HTTP** y en "Source" remplaze el "0.0.0.0/0" por **acm-web** y cuando aparecer el id, seleccione el **sg-xxxxxxxxxxx**
- __3.6.__ Haga click en **Save**
- __3.7.__ En el menu lateral haga click en **Target Groups**
- __3.8.__ Seleccione el **webserver1** y haga click en la pestaña **Targets**
- __3.9.__ Vea si la instancia muestra **Status** como **healthy**
- __3.10.__ Si todavía sigue **unhealthy** espere alguns segundos, haga click en icono de refresh hasta que cambie de estado
- __3.11.__ Pruebe si el servicio funciona correctamente en:

[https://<span class="lb-dns">&lt;ELB DNS name&gt;</span>](https://<span class="lb-dns">&lt;ELB DNS name&gt;</span>/)<br>

- __3.12.__ Accepte el certificado digital auto-firmado haciendo click en **Advanced...** y **Accept the Risk and Continue**
</details>